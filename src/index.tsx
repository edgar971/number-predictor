import * as React from 'react'
import { render } from 'react-dom'
import { VictoryChart, VictoryLabel, VictoryLine, VictoryTheme } from 'victory'
import DrawingCanvas from './DrawingCanvas'
import PretrainedModel from './MnistPredictor/pretrained-model'

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

  private predictNumber(getImageData: () => ImageData): void {
    const imageData = getImageData()
    this.setState(state => ({ ...state, imageData }))
  }

  private toggleModelType = () => {
    this.setState(state => ({ ...state, showLocalModelPredictor: !state.showLocalModelPredictor }))
  }

  private updateTrainingResults = (data: any): void => {
    const x = this.state.trainingResults.length + 1
    const y = data.accuracy * 100
    const results = this.state.trainingResults
    results.push({ x, y })
    this.setState(state => ({ ...state, trainingResults: results }))
  }

  public render() {
    return (
      <React.Fragment>
        <header className="app-header">
          <h1>Number predictor with Tensorflow.js</h1>
          <a href="https://github.com/edgar971/number-recognition">
            <span>
              Source Code and <br /> Readme
            </span>
          </a>
        </header>
        <main>
          <div className="model-toggle">
            <input
              type="checkbox"
              id="togglePredictor"
              onChange={this.toggleModelType}
              checked={this.state.showLocalModelPredictor}
            />
            <label className="model-label" htmlFor="togglePredictor">
              Use Browser Trained Model
            </label>
          </div>
          <section className="main-content">
            <div className="canvas-wrapper">
              <DrawingCanvas
                render={(clearCanvas, captureDrawing) => {
                  return (
                    <div className="canvas-controls">
                      <button
                        onClick={() => {
                          this.predictNumber(captureDrawing)
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
            <LocalModel onTrainingProgress={this.updateTrainingResults} imageData={this.state.imageData} />
          ) : (
            <PretrainedModel imageData={this.state.imageData} />
          )}
        </main>
        <footer>
          <p>
            <small>Created by Edgar Pino</small>
          </p>
        </footer>
      </React.Fragment>
    )
  }
}

render(<App />, document.getElementById('root'))
