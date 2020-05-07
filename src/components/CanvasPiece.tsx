import React from "react";
import "../css/Canvas.css";
import { ToolType } from "../types/tool";
import { connect } from "react-redux";

interface Props {
  fixedImage: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
}

class CanvasPiece extends React.Component<Props> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContext: CanvasRenderingContext2D | null;

  temporaryCanvas: HTMLCanvasElement;
  temporaryCanvasContext: CanvasRenderingContext2D;

  constructor(props: Props) {
    super(props);

    this.canvasRef = React.createRef();
    this.canvasContext = null;

    this.temporaryCanvas = document.createElement("canvas");
    const context = this.temporaryCanvas.getContext("2d");
    if (context) this.temporaryCanvasContext = context;
    else throw new Error("temporaryCanvasContext の初期化に失敗しました");
  }

  update = () => {
    this.clear();
    this.initialize(this.props.fixedImage);
    for (let i = 0; i < this.props.historyQueue.length; i++) {
      if (this.props.historyQueue[i].isActive) {
        this.commit(this.props.historyQueue[i]);
      }
    }
    window.requestAnimationFrame(this.update);
  };

  componentDidMount() {
    if (this.canvasRef.current) {
      const canvasContext = this.canvasRef.current.getContext("2d");
      if (canvasContext) this.canvasContext = canvasContext;
      else throw new Error("Canvas Context の初期化に失敗しました");
    }
    window.requestAnimationFrame(this.update);
  }

  initialize = (image: HTMLImageElement | HTMLCanvasElement) => {
    if (!this.canvasContext) throw new Error("Canvas Context が利用できません");
    this.clear();
    this.canvasContext.globalAlpha = 1.0;
    this.canvasContext.globalCompositeOperation = "source-over";
    this.canvasContext.drawImage(image, 0, 0);
  };

  commit = (action: any) => {
    if (!this.canvasContext) throw new Error("Canvas Context が利用できません");
    this.canvasContext.globalAlpha = action.tool.alpha;
    this.canvasContext.globalCompositeOperation =
      action.tool.type === ToolType.Pen ? "source-over" : "destination-out";

    if (action.image) {
      this.canvasContext.drawImage(action.image, action.left, action.top);
    } else if (action.stroke.length > 1) {
      const width = action.right - action.left;
      const height = action.bottom - action.top;
      this.temporaryCanvas.width = width;
      this.temporaryCanvas.height = height;
      this.temporaryCanvasContext?.clearRect(0, 0, width, height);

      if (this.temporaryCanvasContext) {
        this.temporaryCanvasContext.lineCap = "round";
        this.temporaryCanvasContext.lineJoin = "round";
        this.temporaryCanvasContext.strokeStyle = action.tool.color;
      }

      for (let i = 1; i < action.stroke.length; i++) {
        const previousPoint = action.stroke[i - 1];
        const point = action.stroke[i];
        const thickness = point.force * action.tool.thicknessCoefficient;

        if (this.temporaryCanvasContext) {
          this.temporaryCanvasContext.beginPath();
          this.temporaryCanvasContext.lineWidth = thickness;
          this.temporaryCanvasContext.moveTo(
            previousPoint.x - action.left,
            previousPoint.y - action.top
          );
          this.temporaryCanvasContext.lineTo(
            point.x - action.left,
            point.y - action.top
          );
          this.temporaryCanvasContext.stroke();
        }
      }

      this.canvasContext.drawImage(
        this.temporaryCanvas,
        action.left,
        action.top
      );
    }
  };

  clear = () => {
    if (!this.canvasContext) throw new Error("Canvas Context が利用できません");
    this.canvasContext.clearRect(
      0,
      0,
      this.props.canvasWidth,
      this.props.canvasHeight
    );
  };

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        className="canvas-piece"
        width={this.props.canvasWidth}
        height={this.props.canvasHeight}
      ></canvas>
    );
  }
}

export default connect(null, { })(CanvasPiece)
