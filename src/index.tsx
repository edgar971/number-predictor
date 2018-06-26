import * as React from 'react'
import { render } from 'react-dom'
import DrawingCanvas from './DrawingCanvas'
import './index.css'
import MnistPredictor from './MnistPredictor'

interface AppState {
  imageData: ImageData | null
}

class App extends React.Component<{}, AppState> {
  public readonly state: AppState = {
    imageData: null
  }

  private predict(getImageData: () => ImageData): void {
    const imageData = getImageData()
    this.setState(state => ({ ...state, imageData }))
  }
  public render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Number predictor with Tensorflow.js</h1>
        <DrawingCanvas
          render={(clearCanvas, captureDrawing) => {
            return (
              <div>
                <button onClick={clearCanvas}>Clear</button>
                <button
                  onClick={() => {
                    this.predict(captureDrawing)
                  }}
                >
                  Predict
                </button>
              </div>
            )
          }}
        />
        <MnistPredictor imageData={this.state.imageData} />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
