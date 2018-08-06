import * as React from 'react'
import { render } from 'react-dom'
import { VictoryChart, VictoryLabel, VictoryLine, VictoryTheme } from 'victory'
import DrawingCanvas from './DrawingCanvas'
import PretrainedMnistPredictor from './MnistPredictor/pretrained-model'

import './index.css'
import LocalModel from './MnistPredictor/local-model'

interface AppState {
  imageData: ImageData | null
  showLocalModelPredictor: boolean
  trainingResults: any[]
}

class App extends React.Component<{}, AppState> {
  public readonly state: AppState = {
    imageData: null,
    showLocalModelPredictor: false,
    trainingResults: []
  }

  private predict(getImageData: () => ImageData): void {
    const imageData = getImageData()
    this.setState(state => ({ ...state, imageData }))
  }

  private togglePredictor = () => {
    this.setState(state => ({ ...state, showLocalModelPredictor: !state.showLocalModelPredictor }))
  }

  private setTrainingResults = (data: any): void => {
    const x = this.state.trainingResults.length + 1
    const y = data.accuracy * 100
    const results = this.state.trainingResults
    results.push({ x, y })
    this.setState(state => ({ ...state, trainingResults: results }))
  }

  public render() {
    return (
      <React.Fragment>
        <header>
          <h1>Number predictor with Tensorflow.js</h1>
        </header>
        <main>
          <div className="model-toggle">
            <input
              type="checkbox"
              id="togglePredictor"
              onChange={this.togglePredictor}
              checked={this.state.showLocalModelPredictor}
            />
            <label htmlFor="togglePredictor">Use Browser Trained Model</label>
          </div>
          <section className="main-content">
            <div className="canvas-wrapper">
              <DrawingCanvas
                render={(clearCanvas, captureDrawing) => {
                  return (
                    <div className="canvas-controls">
                      <button
                        onClick={() => {
                          this.predict(captureDrawing)
                        }}
                      >
                        Predict
                      </button>
                      <button onClick={clearCanvas}>Clear</button>
                    </div>
                  )
                }}
              />
            </div>
            {this.state.showLocalModelPredictor && (
              <div className="training-results">
                <VictoryChart theme={VictoryTheme.material} animate={{ duration: 250, easing: 'cubicIn' }}>
                  <VictoryLabel text="Training Results" x={200} y={30} textAnchor="middle" />
                  <VictoryLine
                    style={{
                      data: { stroke: '#c43a31' },
                      parent: { border: '1px solid #ccc' }
                    }}
                    data={this.state.trainingResults}
                  />
                </VictoryChart>
              </div>
            )}
          </section>
          {this.state.showLocalModelPredictor ? (
            <LocalModel onTrainingProgress={this.setTrainingResults} imageData={this.state.imageData} />
          ) : (
            <PretrainedMnistPredictor imageData={this.state.imageData} />
          )}
        </main>
      </React.Fragment>
    )
  }
}

render(<App />, document.getElementById('root'))
