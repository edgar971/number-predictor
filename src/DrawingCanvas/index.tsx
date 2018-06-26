import * as React from 'react'
import './styles.css'

interface DrawingCanvasProps {
  onGetImage?: () => void
  render: (onClearClick: () => void, getImageDrawing: () => ImageData) => JSX.Element
}

class DrawingCanvas extends React.Component<DrawingCanvasProps> {
  protected paint = false
  protected clickX = new Array()
  protected clickY = new Array()
  protected clickDrag = new Array()
  protected canvas: HTMLCanvasElement
  protected canvasContext: CanvasRenderingContext2D

  constructor(props: DrawingCanvasProps) {
    super(props)

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.addClick = this.addClick.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.togglePaint = this.togglePaint.bind(this)
    this.setRef = this.setRef.bind(this)
  }

  public componentDidMount() {
    const context = this.canvas.getContext('2d')
    if (context) {
      this.canvasContext = context
    }
  }

  public handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>): void {
    const target = event.target as any
    const mouseX = event.pageX - target.offsetLeft
    const mouseY = event.pageY - target.offsetTop

    this.paint = true

    this.addClick(mouseX, mouseY)
    this.redraw()
  }

  public handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>): void {
    if (this.paint) {
      const target = event.target as any
      const mouseX = event.pageX - target.offsetLeft
      const mouseY = event.pageY - target.offsetTop

      this.addClick(mouseX, mouseY, true)
      this.redraw()
    }
  }

  public togglePaint(): void {
    this.paint = false
  }

  public addClick(x: number, y: number, dragging?: boolean): void {
    this.clickX.push(x)
    this.clickY.push(y)
    this.clickDrag.push(dragging)
  }

  public clearClicks(): void {
    this.clickDrag = []
    this.clickX = []
    this.clickY = []
  }

  protected clearCanvas() {
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height)
  }

  protected clear = (): void => {
    this.clearCanvas()
    this.clearClicks()
  }

  protected redraw(): void {
    this.clearCanvas()

    this.canvasContext.strokeStyle = 'gray'
    this.canvasContext.lineJoin = 'round'
    this.canvasContext.lineWidth = 20

    for (let i = 0; i < this.clickX.length; i++) {
      this.canvasContext.beginPath()
      if (this.clickDrag[i] && i) {
        this.canvasContext.moveTo(this.clickX[i - 1], this.clickY[i - 1])
      } else {
        this.canvasContext.moveTo(this.clickX[i] - 1, this.clickY[i])
      }
      this.canvasContext.lineTo(this.clickX[i], this.clickY[i])
      this.canvasContext.closePath()
      this.canvasContext.stroke()
    }
  }

  protected captureDrawing = (): ImageData => {
    this.canvasContext.drawImage(this.canvas, 0, 0, 28, 28)
    return this.canvasContext.getImageData(0, 0, 28, 28)
  }

  public setRef(ref: HTMLCanvasElement) {
    if (ref) {
      this.canvas = ref
    }
  }

  public render() {
    return (
      <React.Fragment>
        <canvas
          ref={this.setRef}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.togglePaint}
          onMouseLeave={this.togglePaint}
          className="drawing-canvas"
          width="400"
          height="400"
        />
        {this.props.render(this.clear, this.captureDrawing)}
      </React.Fragment>
    )
  }
}

export default DrawingCanvas
