import * as tf from '@tensorflow/tfjs'
import * as React from 'react'
import { MnistData } from './mnist-Data'

interface PretrainedModelProps {
  imageData: ImageData | null
}

interface PretrainedModelState {
  predictedNumber: number
}

class PretrainedModel extends React.Component<PretrainedModelProps, PretrainedModelState> {
  protected model: tf.Model
  protected data: MnistData

  constructor(props: PretrainedModelProps) {
    super(props)
    this.state = {
      predictedNumber: 0
    }
    this.predictNumber = this.predictNumber.bind(this)
    this.loadPretrainedModel()
  }

  public async loadPretrainedModel(): Promise<void> {
    this.model = await tf.loadModel('./assets/model.json')
  }

  public async componentWillReceiveProps(props: PretrainedModelProps): Promise<void> {
    if (props.imageData) {
      const predictedNumber = await this.predictNumber(props.imageData)
      this.setState(state => ({ ...state, predictedNumber }))
    }
  }

  public async predictNumber(imageData: ImageData): Promise<number> {
    return await tf.tidy(() => {
      let img: any = tf.fromPixels(imageData, 1)
      img = img.reshape([1, 28, 28, 1])
      img = tf.cast(img, 'float32')

      const output = this.model.predict(img) as any
      const predictions = Array.from(output.dataSync())
      return predictions.reduce((prev: any, cur: any, index: any) => (cur > prev ? index : prev), 0)
    })
  }

  public render() {
    return (
      <React.Fragment>
        <h1 className="predicted-number">Predicted Number: {this.state.predictedNumber}</h1>
      </React.Fragment>
    )
  }
}

export default PretrainedModel
