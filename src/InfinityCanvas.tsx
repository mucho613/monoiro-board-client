import React from "react";
import "./Canvas.css";
import CanvasPiece from "./CanvasPiece";
import { Tool } from "./Tool";

interface Props {
  selectedTool: Tool;
  fixedImage: HTMLCanvasElement | HTMLImageElement;
  historyQueue: Array<any>;
}

class InfinityCanvas extends React.Component<Props> {
  canvasWidth = 2048;
  canvasHeight = 2048;
  canvasPiece: React.RefObject<CanvasPiece>;

  constructor(props: Props) {
    super(props);
    this.canvasPiece = React.createRef<CanvasPiece>();
  }

  getCanvasImageBase64 = () => this.canvasPiece.current?.getCanvasImageBase64();

  render() {
    return (
      <div className="canvas">
        <CanvasPiece
          ref={this.canvasPiece}
          canvasWidth={this.canvasWidth}
          canvasHeight={this.canvasHeight}
          fixedImage={this.props.fixedImage}
          historyQueue={this.props.historyQueue}
        />
      </div>
    );
  }
}

export default InfinityCanvas;
