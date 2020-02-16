import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Controller from './Controller';

import Canvas from './Canvas';
import History from './History';
import Tool from './Tool';

class App extends React.Component {
  historyQueueMaxLength = 10;

  constructor() {
    super();

    this.socket = io.connect('http://localhost:8080');

    this.history = new History(this.historyQueueMaxLength, this.socket);

    this.tools = {
      pen: new Tool('pen', 'ペン', '#555555', 1.0, 16),
      eraser: new Tool('eraser', '消しゴム', '#ffffff', 1.0, 64)
    };

    this.state = {
      id: null,
      tools: this.tools,
      selectedTool: this.tools.pen
    }
  }

  componentDidMount() {
    this.downloadLink = document.getElementById('download-link');

    window.addEventListener('pageshow', e => e.persisted && window.location.reload());
    window.addEventListener('scroll', () => this.scrolled = true);

    this.socket.on('init', initializeData => {
      const image = new Image();
      image.src = initializeData.imageData;
      setTimeout(() => this.refs.canvas.initialize(image), 0);
      this.setState({ id: this.socket.id, undoHistory: initializeData.undoHistory });
      console.log('Initial history', initializeData.undoHistory);
    });
  }

  handleActionStart = (x, y, force) => {
    this.history.localActionStart(Object.assign({}, this.state.selectedTool));
    this.history.localActionUpdate({ x: x, y: y, force: force });
    this.canvasUpdate();
  }
  handleActionUpdate = (x, y, force) => {
    this.history.localActionUpdate({ x: x, y: y, force: force });
    this.canvasUpdate();
  }
  handleActionEnd = (x, y, force) => {
    this.history.localActionUpdate({ x: x, y: y, force: force });
    this.history.localActionEnd();
    this.canvasUpdate();
  }
  handleUndo = () => {
    this.history.localUndo();
    this.canvasUpdate();
  }

  handleToolChange = tools => this.setState({ tools: tools });
  handleSelectedToolChange = tool => this.setState({ selectedTool: tool });

  canvasUpdate = () => {
    this.refs.canvas.update(this.history.getQueue());
  }

  render() {
    return (
      <div className="App">
        <Controller
          selectedTool={this.state.selectedTool}
          tools={this.state.tools}
          onToolChange={this.handleToolChange}
          onSelectedToolChange={this.handleSelectedToolChange}
          onUndo={this.handleUndo}
          onDownload={this.handleDownload}
          onStrokeStart={this.handleActionStart}
          onStrokeMove={this.handleActionUpdate}
          onStrokeEnd={this.handleActionEnd}
        />

        <Canvas
          initialImage={this.state.initialImage}
          history={this.history}
          ref={'canvas'}
          selectedTool={this.state.selectedTool}
        />
      </div>
    );
  }
}

export default App;
