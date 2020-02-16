import React from 'react';

import CanvasController from './CanvasController';
import ToolBox from './ToolBox';

import './App.css';

class Controller extends React.Component {
  handleToolChange = tools => this.props.onToolChange(tools);
  handleSelectedToolChange = tool => this.props.onSelectedToolChange(tool);
  handleUndo = () => this.props.onUndo();
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
      <div className="controller">
        <ToolBox
          selectedTool={this.props.selectedTool}
          tools={this.props.tools}
          onToolChange={this.handleToolChange}
          onSelectedToolChange={this.handleSelectedToolChange}
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
