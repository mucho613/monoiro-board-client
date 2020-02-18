import React from 'react';

import CanvasController from './CanvasController';
import ToolBox from './ToolBox';

import './App.css';

class Controller extends React.Component {
  render() {
    return (
      <div className="controller">
        <ToolBox
          selectedTool={this.props.selectedTool}
          tools={this.props.tools}
          onToolChange={this.props.onToolChange}
          onSelectedToolChange={this.props.onSelectedToolChange}
          onUndo={this.props.onUndo}
          onDownload={this.props.onDownload} />
        <CanvasController
          onStrokeStart={this.props.onStrokeStart}
          onStrokeMove={this.props.onStrokeMove}
          onStrokeEnd={this.props.onStrokeEnd} />
      </div>
    );
  }
}

export default Controller;
