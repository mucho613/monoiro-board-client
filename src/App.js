import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Controller from './Controller';

import Canvas from './Canvas';
import History from './History';
import Tool from './Tool';

class App extends React.Component {
  historyQueueMaxLength = 5;

  constructor() {
    super();

    this.socket = io.connect('http://192.168.11.2:8080');

    this.history = new History(this.historyQueueMaxLength, this.socket, this.canvasUpdate);

    this.socket.on('init', initializeData => {
      this.history.setFixedImage(initializeData.fixedImage);
      this.history.setQueue(initializeData.historyQueue);
      this.canvasUpdate();
      this.setState({ id: this.socket.id });
      console.log('Initial history', initializeData.historyQueue);
    });

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
  handleDownload = () => {
    const base64 = this.refs.canvas.getCanvasImageBase64();
    const newWindow = window.open();
    newWindow.document.write('<img src="' + base64 + '" style="width:100%; height:100%; object-fit: contain;"></img>');
  }

  handleToolChange = tools => this.setState({ tools: tools });
  handleSelectedToolChange = tool => this.setState({ selectedTool: tool });

  canvasUpdate = () => {
    this.refs.canvas.update(this.history.fixedImageCanvas, this.history.queue);
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
          ref={'canvas'}
          selectedTool={this.state.selectedTool}
        />
      </div>
    );
  }
}

export default App;
