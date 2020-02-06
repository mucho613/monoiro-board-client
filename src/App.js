import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Toolbox from './ToolBox';
import Canvas from './Canvas';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      splashWindowIsVisible: true,
      leftyUi: false,

      selectedTool: 1,
      penColor: "#555555",
      defaultAlpha: 1.0,

      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64,
    }

    this.socket = io.connect('https://mucho613.space:8080');

    this.socket.on('init', base64 => {
      const image = new Image();
      image.src = base64.imageData;
      setTimeout(() => this.refs.canvas.initialize(image), 0);
    });

    this.socket.on('send user', msg => {
      this.refs.canvas.draw(msg.tool, msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
    });
  }

  componentDidMount() {
    this.downloadLink = document.getElementById('download-link');

    window.addEventListener('pageshow', e => e.persisted && window.location.reload());
    window.addEventListener('scroll', () => this.scrolled = true);
  }

  handleDraw = attribute => this.socket.emit('server send', attribute);

  handleToolChange = tool => this.setState({selectedTool: tool});
  handlePenColorChange = color => this.setState({penColor: color});
  handlePenThicknessChange = thickness => this.setState({penThicknessCoefficient: thickness});
  handleEraserThicknessChange = thickness => this.setState({eraserThicknessCoefficient: thickness});
  handleLeftyChange = isLefty => this.setState({leftyUi: isLefty});
  handleDownload = () => {
    const base64 = this.refs.canvas.getCanvasImageBase64();
    const newWindow = window.open();
    newWindow.document.write('<img src="' + base64 + '" style="width:100%; height:100%; object-fit: contain;"></img>');
  }

  render() {
    return (
      <div className="App">
        <div className={this.state.splashWindowIsVisible ? 'splash' : 'splash hide'}>
          <h1>MONOIRO Board</h1>
          <button onClick={e => this.setState({splashWindowIsVisible: false})}>閉じる</button>
        </div>
        
        <Toolbox
          toolState={this.state}
          onToolChange={this.handleToolChange}
          onPenColorChange={this.handlePenColorChange}
          onPenThicknessChange={this.handlePenThicknessChange}
          onEraserThicknessChange={this.handleEraserThicknessChange}
          onLeftyChange={this.handleLeftyChange}
          onDownload={this.handleDownload}
        />

        <Canvas
          initialImage={this.state.initialImage}
          onDraw={this.handleDraw}
          ref={'canvas'}
          selectedTool={this.state.selectedTool}
          penColor={this.state.penColor}
          defaultAlpha={this.state.defaultAlpha}
          penThicknessCoefficient={this.state.penThicknessCoefficient}
          eraserThicknessCoefficient={this.state.eraserThicknessCoefficient}
        />
      </div>
    );
  }
}

export default App;
