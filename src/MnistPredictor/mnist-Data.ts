import * as tf from '@tensorflow/tfjs'

const IMAGE_SIZE = 784
const NUM_CLASSES = 10
const NUM_DATASET_ELEMENTS = 65000
const NUM_TRAIN_ELEMENTS = 55000
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS
const MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png'
const MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8'

export class MnistData {
  protected shuffledTrainIndex: number
  protected shuffledTestIndex: number
  public datasetImages: Float32Array
  public datasetLabels: Uint8Array
  public trainIndices: Uint32Array
  public testIndices: Uint32Array
  public trainImages: Float32Array
  public testImages: Float32Array
  public trainLabels: any
  public testLabels: any

  constructor() {
    this.shuffledTrainIndex = 0
    this.shuffledTestIndex = 0
  }

  public async load() {
    console.info('Loading training data')
    // Make a request for the MNIST sprited image.
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const imgRequest = new Promise(resolve => {
      img.crossOrigin = ''
      img.onload = () => {
        img.width = img.naturalWidth
        img.height = img.naturalHeight

        const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4)

        const chunkSize = 5000
        canvas.width = img.width
        canvas.height = chunkSize

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize
          )
          ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer)

        resolve()
      }
      img.src = MNIST_IMAGES_SPRITE_PATH
    })

    const labelsRequest = fetch(MNIST_LABELS_PATH)
    const [, labelsResponse] = await Promise.all([imgRequest, labelsRequest])

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer())

    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS)
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS)

    // Slice the the images and labels into train and test sets.
    this.trainImages = this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS)
    this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS)
    this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS)
    this.testLabels = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS)
    console.info('Done Loading training data')
  }

  public nextTrainBatch(batchSize: number) {
    return this.nextBatch(batchSize, [this.trainImages, this.trainLabels], () => {
      this.shuffledTrainIndex = (this.shuffledTrainIndex + 1) % this.trainIndices.length
      return this.trainIndices[this.shuffledTrainIndex]
    })
  }

  public nextTestBatch(batchSize: number) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.shuffledTestIndex = (this.shuffledTestIndex + 1) % this.testIndices.length
      return this.testIndices[this.shuffledTestIndex]
    })
  }

  public nextBatch(batchSize: number, data: any[], index: () => number) {
    const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE)
    const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES)

    for (let i = 0; i < batchSize; i++) {
      const idx = index()

      const image = data[0].slice(idx * IMAGE_SIZE, idx * IMAGE_SIZE + IMAGE_SIZE)
      batchImagesArray.set(image, i * IMAGE_SIZE)

      const label = data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES)
      batchLabelsArray.set(label, i * NUM_CLASSES)
    }

    const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE])
    const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES])

    return { xs, labels }
  }
}