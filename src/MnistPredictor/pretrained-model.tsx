import * as tf from '@tensorflow/tfjs'
import * as React from 'react'
import { MnistData } from './mnist-Data'

interface MnistPredictorProps {
  imageData: ImageData | null
}

interface MnistPredictorState {
  predictedNumber: number
}

class PretrainedMnistPredictor extends React.Component<MnistPredictorProps, MnistPredictorState> {
  protected model: tf.Model
  protected data: MnistData

  constructor(props: MnistPredictorProps) {
    super(props)
    this.state = {
      predictedNumber: 0
    }
    this.predict = this.predict.bind(this)
    this.loadPretrainedModel()
  }

  public async loadPretrainedModel(): Promise<void> {
    this.model = await tf.loadModel('./assets/model.json')
  }

  public async componentWillReceiveProps(props: MnistPredictorProps): Promise<void> {
    if (props.imageData) {
      const predictedNumber = await this.predict(props.imageData)
      this.setState(state => ({ ...state, predictedNumber }))
    }
  }

  public async predict(imageData: ImageData): Promise<number> {
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

export default PretrainedMnistPredictor
