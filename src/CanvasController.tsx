import React from "react";

interface Props {
  onStrokeStart: () => void;
  onStrokeMove: (x: number, y: number, force: number) => void;
  onStrokeEnd: () => void;
}

class CanvasController extends React.Component<Props> {
  // mouseForce = 0.5;
  // penGrounded = false;
  canvasController!: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.canvasController = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    this.canvasController.current?.addEventListener(
      "touchmove",
      this.stopScroll,
      { passive: false }
    );
  }

  stopScroll = (event: TouchEvent) => event.preventDefault();

  // タッチすると MouseDown が発生するのやめてほしいのでコメントアウト(マウスで描けない)
  // handleMouseDown = e => {
  //   // 主ボタンのクリック時しか反応しない
  //   if(e.button === 0) {
  //     const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
  //     // ペンを接地状態にする
  //     this.penGrounded = true;
  //     this.props.onStrokeStart(position.x, position.y, this.mouseForce);
  //     window.alert("Mouse down");
  //   }
  // }

  // handleMouseMove = e => {
  //   if(e.button === 0 && this.penGrounded) {
  //     const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
  //     this.props.onStrokeMove(position.x, position.y, this.mouseForce);
  //   }
  // }

  // handleMouseUp = e => {
  //   // 主ボタンのクリック時しか反応しない
  //   if(e.button === 0) {
  //     const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
  //     // ペンの接地状態を解除
  //     this.penGrounded = false;
  //     this.props.onStrokeEnd(position.x, position.y, this.mouseForce);
  //   }
  // }

  handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch: any = event.changedTouches[0];

    if (touch.touchType === "direct") {
      this.canvasController.current?.removeEventListener(
        "touchmove",
        this.stopScroll
      );
      return;
    }

    const position = this.getCanvasPositionFromClientPosition(
      touch.clientX,
      touch.clientY
    );
    this.props.onStrokeStart();
    this.props.onStrokeMove(position.x, position.y, touch.force / 2);
  };

  handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch: any = event.changedTouches[0];

    if (touch.touchType === "direct") {
      this.canvasController.current?.removeEventListener(
        "touchmove",
        this.stopScroll
      );
      return;
    } else if (touch.touchType === "stylus") {
      this.canvasController.current?.addEventListener(
        "touchmove",
        this.stopScroll,
        { passive: false }
      );
    }

    const position = this.getCanvasPositionFromClientPosition(
      touch.clientX,
      touch.clientY
    );
    this.props.onStrokeMove(position.x, position.y, touch.force);
  };

  handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch: any = event.changedTouches[0];

    this.canvasController.current?.addEventListener(
      "touchmove",
      this.stopScroll,
      { passive: false }
    );
    if (touch.touchType === "direct") return;

    const position = this.getCanvasPositionFromClientPosition(
      touch.clientX,
      touch.clientY
    );
    this.props.onStrokeMove(position.x, position.y, touch.force);
    this.props.onStrokeEnd();
  };

  getCanvasPositionFromClientPosition = (x: number, y: number) => {
    return {
      x: ~~(x + window.pageXOffset),
      y: ~~(y + window.pageYOffset)
    };
  };

  shouldComponentUpdate = () => false;

  render() {
    return (
      <div
        // onMouseDown={this.handleMouseDown}
        // onMouseMove={this.handleMouseMove}
        // onMouseUp={this.handleMouseUp}
        ref={this.canvasController}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        className={"canvas-controller"}
      />
    );
  }
}

export default CanvasController;
