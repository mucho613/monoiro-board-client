import React from 'react';

import CanvasController from './CanvasController';
import ToolBox from './ToolBox';

class Controller extends React.Component {
  handleToolChange = tool => this.setState({ selectedTool: tool });
  handleUndo = () => this.onUndo();
  handleDownload = () => {
    const base64 = this.refs.canvas.getCanvasImageBase64();
    const newWindow = window.open();
    newWindow.document.write('<img src="' + base64 + '" style="width:100%; height:100%; object-fit: contain;"></img>');
  }

  handleStrokeStart = (x, y, force) => this.props.onStrokeStart(x, y, force)
  handleStrokeMove = (x, y, force) => this.props.onStrokeMove(x, y, force)
  handleStrokeEnd = (x, y, force) => this.props.onStrokeEnd(x, y, force)

  render() {
    return (
      <div>
        <ToolBox
          onToolChange={this.handleToolChange}
          onUndo={this.handleUndo}
          onDownload={this.handleDownload} />
        <CanvasController
          onStrokeStart={this.handleStrokeStart}
          onStrokeMove={this.handleStrokeMove}
          onStrokeEnd={this.handleStrokeEnd} />
      </div>
    );
  }
}

export default Controller;
