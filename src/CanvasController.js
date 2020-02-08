import React from 'react';

class CanvasController extends React.Component {
  mouseForce = 0.5;

  penGrounded = false;
  previousForce = 0;
  initialTouch = true;

  componentDidMount() {
    this.canvasController = document.getElementById('canvas-controller');
    this.canvasController.addEventListener('touchmove', this.stopScroll, { passive: false });
  }

  stopScroll = e => e.preventDefault();

  handleMouseDown = e => {
    const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
    // ペンを接地状態にする
    this.penGrounded = true;
    this.props.onStrokeStart(position.x, position.y, this.mouseForce);
  }

  handleMouseMove = e => {
    if(this.penGrounded) {
      const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
      this.props.onStrokeMove(position.x, position.y, this.mouseForce);
    }
  }

  handleMouseUp = e => {
    const position = this.getCanvasPositionFromClientPosition(e.clientX, e.clientY);
    // ペンの接地状態を解除
    this.penGrounded = false;
    this.props.onStrokeEnd(position.x, position.y, this.mouseForce);
  }

  handleTouchStart = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvasController.removeEventListener('touchmove', this.stopScroll);
      return;
    }

    const position = this.getCanvasPositionFromClientPosition(touch.clientX, touch.clientY);
    this.props.onStrokeStart(position.x, position.y, touch.force);
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
    let force;
    const currentForce = touch.force;

    if(this.initialTouch) {
      force = 0;
      this.previousForce = currentForce;
      this.initialTouch = false;
    } 
    else force = (currentForce + this.previousForce) / 2;

    this.props.onStrokeMove(position.x, position.y, force);
  }

  handleTouchEnd = e => {
    const touch = e.changedTouches[0];

    this.canvasController.addEventListener('touchmove', this.stopScroll, { passive: false });
    if(touch.touchType === 'direct') return;

    this.initialTouch = true;

    const position = this.getCanvasPositionFromClientPosition(touch.clientX, touch.clientY);
    this.props.onStrokeEnd(position.x, position.y, touch.force);
  }

  getCanvasPositionFromClientPosition = (x, y) => {
    return {
      x: this.canvasController.scrollLeft - x,
      y: this.canvasController.scrollTop - y
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
