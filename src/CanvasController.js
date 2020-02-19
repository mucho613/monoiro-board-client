import React from 'react';

class CanvasController extends React.Component {
  // mouseForce = 0.5;
  // penGrounded = false;

  componentDidMount() {
    this.canvasController = document.getElementById('canvas-controller');
    this.canvasController.addEventListener('touchmove', this.stopScroll, { passive: false });
  }

  stopScroll = e => e.preventDefault();

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

  handleTouchStart = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvasController.removeEventListener('touchmove', this.stopScroll);
      return;
    }

    const position = this.getCanvasPositionFromClientPosition(touch.clientX, touch.clientY);
    this.props.onStrokeStart();
    this.props.onStrokeMove(position.x, position.y, touch.force / 2);
  }

  handleTouchMove = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvasController.removeEventListener('touchmove', this.stopScroll);
      return;
    } else if(touch.touchType === 'stylus') {
      this.canvasController.addEventListener('touchmove', this.stopScroll, { passive: false });
    }

    const position = this.getCanvasPositionFromClientPosition(touch.clientX, touch.clientY);
    this.props.onStrokeMove(position.x, position.y, touch.force);
  }

  handleTouchEnd = e => {
    const touch = e.changedTouches[0];

    this.canvasController.addEventListener('touchmove', this.stopScroll, { passive: false });
    if(touch.touchType === 'direct') return;

    this.initialTouch = true;

    const position = this.getCanvasPositionFromClientPosition(touch.clientX, touch.clientY);
    this.props.onStrokeMove(position.x, position.y, touch.force);
    this.props.onStrokeEnd();
  }

  getCanvasPositionFromClientPosition = (x, y) => {
    return {
      x: ~~(x + window.pageXOffset),
      y: ~~(y + window.pageYOffset)
    }
  }

  // TODO: 最初から更新が走らなさそうなので書く意味無いかも
  shouldComponentUpdate = () => false;

  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        className={'canvas-controller'}
        id={'canvas-controller'}/>
    );
  }
}

export default CanvasController;
