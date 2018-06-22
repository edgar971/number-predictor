import * as React from 'react'
import './App.css'

import DrawingCanvas from './DrawingCanvas'
import logo from './logo.svg'


class App extends React.Component {

  constructor(props: any) {
    super(props)
    this.state = {
      clear: false
    }
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Number Recognition</h1>
        </header>
        <p className="App-intro">
          Draw a number below
        </p>
        <DrawingCanvas render={(eventHandler) => (
          <div>
            <button onClick={eventHandler}>Clear</button>
          </div>
        )} />
      </div>
    )
  }
}

export default App
