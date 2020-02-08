import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Controller from './Controller';

import Canvas from './Canvas';
import History from './History';

class App extends React.Component {
  historyQueueMaxLength = 10;

  constructor() {
    super();

    this.socket = io.connect('http://localhost:8080');

    this.history = new History(this.historyQueueMaxLength, this.socket);

    this.state = {
      splashWindowIsVisible: true,
      leftyUi: false,

      selectedTool: 'Pen',
      penColor: '#555555',
      alpha: 1.0,

      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64,

      id: null,
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

  handleActionStart = () => this.history.localActionStart(this.props.tool, this.props.penColor, this.props.alpha);
  handleActionUpdate = line => {
    this.history.localActionUpdate(line);
    this.canvasUpdate();
  }
  handleActionEnd = () => {
    this.history.localActionEnd();
    this.canvasUpdate();
  }
  handleUndo = () => this.history.localUndo();

  handleToolChange = tool => this.setState({ selectedTool: tool });
  handlePenColorChange = (color, alpha) => this.setState({ penColor: color, alpha: alpha });
  handlePenThicknessChange = thickness => this.setState({ penThicknessCoefficient: thickness });
  handleEraserThicknessChange = thickness => this.setState({ eraserThicknessCoefficient: thickness });
  handleLeftyChange = isLefty => this.setState({ leftyUi: isLefty });
  handleDownload = () => {
    const base64 = this.refs.canvas.getCanvasImageBase64();
    const newWindow = window.open();
    newWindow.document.write('<img src="' + base64 + '" style="width:100%; height:100%; object-fit: contain;"></img>');
  }

  canvasUpdate = () => {
    this.refs.canvas.update(this.history.getQueue());
  }

  render() {
    return (
      <div className="App">
        <div className={this.state.splashWindowIsVisible ? 'splash' : 'splash hide'}>
          <h1>MONOIRO Board</h1>
          <button onClick={e => this.setState({ splashWindowIsVisible: false })}>閉じる</button>
        </div>
        
        <Controller
          onToolChange={this.handleToolChange}
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
          penColor={this.state.penColor}
          alpha={this.state.alpha}
          penThicknessCoefficient={this.state.penThicknessCoefficient}
          eraserThicknessCoefficient={this.state.eraserThicknessCoefficient}
        />
      </div>
    );
  }
}

export default App;
