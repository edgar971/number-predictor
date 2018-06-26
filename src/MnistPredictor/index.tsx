import * as tf from '@tensorflow/tfjs'
import * as React from 'react'

interface MnistPredictorProps {
  imageData: ImageData | null
}

interface MnistPredictorState {
  predictedNumber: number
}

class MnistPredictor extends React.Component<MnistPredictorProps, MnistPredictorState> {
  protected model: tf.Model

  constructor(props: MnistPredictorProps) {
    super(props)
    this.state = {
      predictedNumber: 0
    }

    this.predict = this.predict.bind(this)
    this.loadModel()
  }

  public async loadModel(): Promise<void> {
    this.model = await tf.loadModel('./assets/model.json')
    console.log('summary', this.model.summary())
  }

  public async componentWillReceiveProps(props: MnistPredictorProps): Promise<void> {
    if (props.imageData) {
      const predictedNumber = await this.predict(props.imageData)
      this.setState(state => ({ ...state, predictedNumber }))
    }
  }

  public async predict(imageData: ImageData): Promise<number> {
    return await tf.tidy(() => {
      let maxProb = 0
      let predictedNumber = 0

      let img: any = tf.fromPixels(imageData, 1)
      img = img.reshape([1, 28, 28, 1])
      img = tf.cast(img, 'float32')

      const output = this.model.predict(img) as any
      const predictions = Array.from(output.dataSync())
      predictions.forEach((prob: number, num: number) => {
        if (prob > maxProb) {
          maxProb = prob
          predictedNumber = num
        }
      })

      return predictedNumber
    })
  }

  public render() {
    return <h1>Predicted Number: {this.state.predictedNumber}</h1>
  }
}

export default MnistPredictor
