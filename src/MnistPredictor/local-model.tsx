import * as tf from '@tensorflow/tfjs'
import * as React from 'react'
import { MnistData } from './mnist-Data'

const LEARNING_RATE = 0.15
const BATCH_SIZE = 64
const TRAIN_BATCHES = 200
const TEST_BATCH_SIZE = 1000
const TEST_ITERATION_FREQUENCY = 5

interface LocalModelProps {
  imageData: ImageData | null
  onTrainingProgress: (data: any) => void
}

interface LocalModelState {
  predictedNumber: number
  isTraining: boolean
}

export default class LocalModel extends React.Component<LocalModelProps, LocalModelState> {
  protected model: tf.Sequential
  protected data: MnistData
  protected isDataLoaded: boolean

  constructor(props: LocalModelProps) {
    super(props)
    this.data = new MnistData()
    this.createLocalModel()
    this.isDataLoaded = false
    this.state = {
      predictedNumber: 0,
      isTraining: false
    }
  }

  public async componentWillReceiveProps(props: LocalModelProps) {
    if (props.imageData) {
      const predictedNumber = await this.predictNumber(props.imageData)
      this.setState(state => ({ ...state, predictedNumber }))
    }
  }

  private async predictNumber(imageData: ImageData): Promise<number> {
    return await tf.tidy(() => {
      let img: any = tf.fromPixels(imageData, 1)
      img = img.reshape([1, 28, 28, 1])
      img = tf.cast(img, 'float32')

      const output = this.model.predict(img) as any
      const predictions = Array.from(output.dataSync())
      return predictions.reduce((prev: any, cur: any, index: any) => (cur > prev ? index : prev), 0)
    })
  }

  /**
   * Create our Convolutional Neural Network (CNN)
   * 1 input 3 hidden and the output layer.
   */
  public async createLocalModel() {
    this.model = tf.sequential()

    const inputLayer = tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    })

    const hiddenLayer1 = tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    })

    const hiddenLayer2 = tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    })

    const hiddenLayer3 = tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    })

    const outputLayer = tf.layers.dense({
      units: 10,
      kernelInitializer: 'VarianceScaling',
      activation: 'softmax'
    })

    if (this.model instanceof tf.Sequential) {
      this.model.add(inputLayer)
      this.model.add(hiddenLayer1)
      this.model.add(hiddenLayer2)
      this.model.add(hiddenLayer3)
      this.model.add(tf.layers.flatten())
      this.model.add(outputLayer)
    }

    const optimizer = tf.train.sgd(LEARNING_RATE)

    this.model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
  }

  public async loadTrainingData() {
    await this.data.load()
    this.isDataLoaded = true
  }

  public loadAndTrainModel = async () => {
    this.setState(() => ({ isTraining: true }))
    if (!this.isDataLoaded) {
      await this.loadTrainingData()
    }

    await this.trainModel()
    this.setState(() => ({ isTraining: false }))
  }

  public async trainModel() {
    const lossValues = []
    const accuracyValues = []

    // Iteratively train our model on mini-batches of data.
    for (let i = 0; i < TRAIN_BATCHES; i++) {
      const [batch, validationData] = tf.tidy(() => {
        const nextBatch = this.data.nextTrainBatch(BATCH_SIZE)
        nextBatch.xs = nextBatch.xs.reshape([BATCH_SIZE, 28, 28, 1]) as any

        let nextValidationData
        // Every few batches test the accuracy of the model.
        if (i % TEST_ITERATION_FREQUENCY === 0) {
          const testBatch = this.data.nextTestBatch(TEST_BATCH_SIZE)
          nextValidationData = [
            // Reshape the training data from [64, 28x28] to [64, 28, 28, 1] so
            // that we can feed it to our convolutional neural net.
            testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]),
            testBatch.labels
          ]
        }
        return [nextBatch, nextValidationData]
      }) as any

      // The entire dataset doesn't fit into memory so we call train repeatedly
      // with batches using the fit() method.
      const history = await this.model.fit(batch.xs, batch.labels, { batchSize: BATCH_SIZE, validationData, epochs: 1 })

      const loss = history.history.loss[0]
      const accuracy = history.history.acc[0]

      // Plot loss / accuracy.
      lossValues.push({ batch: i, loss, set: 'train' })

      if (validationData != null) {
        const accuracyValue = { batch: i, accuracy, set: 'train' }
        accuracyValues.push(accuracyValue)
        this.props.onTrainingProgress(accuracyValue)
      }

      // Call dispose on the training/test tensors to free their GPU memory.
      tf.dispose([batch, validationData])

      // tf.nextFrame() returns a promise that resolves at the next call to
      // requestAnimationFrame(). By awaiting this promise we keep our model
      // training from blocking the main UI thread and freezing the browser.
      await tf.nextFrame()
    }
  }

  public render() {
    return (
      <React.Fragment>
        <button onClick={this.loadAndTrainModel} disabled={this.state.isTraining}>
          {!this.state.isTraining ? 'Train Local Model' : 'Training...'}
        </button>
        <h1 className="predicted-number">Predicted Number: {this.state.predictedNumber}</h1>
      </React.Fragment>
    )
  }
}
