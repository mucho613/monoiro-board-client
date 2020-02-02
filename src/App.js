import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Toolbox from './ToolBox';
import Canvas from './Canvas';

class App extends React.Component {
  socket = io.connect('https://mucho613.space:8080');

  constructor() {
    super();

    this.state = {
      splashWindowIsVisible: true,
      leftyUi: false,

      selectedTool: 1,
      penColor: "#555555",
      eraserColor: "#f5f5f5",
      defaultAlpha: 1.0,

      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64,

      initialImage: null
    }
  }

  componentDidMount() {
    this.downloadLink = document.getElementById('download-link');

    window.addEventListener('pageshow', e => e.persisted && window.location.reload());
    window.addEventListener('scroll', () => this.scrolled = true);
 
    this.socket.on('init', base64 => {
      let initImage = base64.imageData;
      const img = new Image();
      img.src = initImage;

      this.setState({initialImage: img});
    });

    this.socket.on('send user', msg => {
      // これを消すとタピオカ
      if(msg.thickness !== 0) {
        this.refs.canvas.draw(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
      }
    });
  }

  handleDraw = attribute => this.socket.emit('server send', attribute);

  handleToolChange = tool => this.setState({selectedTool: tool});
  handlePenColorChange = color => this.setState({penColor: color});
  handlePenThicknessChange = thickness => this.setState({penThicknessCoefficient: thickness});
  handleEraserThicknessChange = thickness => this.setState({eraserThicknessCoefficient: thickness});
  handleLeftyChange = isLefty => this.setState({leftyUi: isLefty});
  handleDownload = () => {
    this.downloadLink.href = this.canvas.toDataURL('image/png');
    this.downloadLink.download = "monoiro.png";
    this.downloadLink.click();
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
        />
      </div>
    );
  }
}

export default App;
