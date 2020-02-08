import React from 'react';

import Pickr from '@simonwep/pickr/dist/pickr.es5.min';
import '@simonwep/pickr/dist/themes/nano.min.css';

import './ToolBox.css';

class ToolBox extends React.Component {
  handleToolChange = () => this.props.onToolChange(this.state);

  handlePenColorChange = (color, alpha) => this.setState({ penColor: color, alpha: alpha });
  penThicknessChange = thickness => this.setState({ penThicknessCoefficient: thickness });
  eraserThicknessChange = thickness => this.setState({ eraserThicknessCoefficient: thickness });
  leftyChange = isLefty => this.setState({ isLefty: isLefty });
  undo = () => this.props.onUndo();
  download = () => this.props.onDownload();

  constructor(props) {
    super(props);

    this.state = {
      penColor: '#555555',
      alpha: 1.0,
      leftyUi: false,
      selectedTool: 'Pen',
      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64
    }
  }

  componentDidMount() {
    const pickr = Pickr.create({
      el: '.color-picker',
      theme: 'nano',

      swatches: [
        'rgba(244, 67, 54, 1)', 'rgba(233, 30, 99, 0.95)', 'rgba(156, 39, 176, 0.9)', 'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)', 'rgba(33, 150, 243, 0.75)', 'rgba(3, 169, 244, 0.7)', 'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)', 'rgba(76, 175, 80, 0.8)', 'rgba(139, 195, 74, 0.85)', 'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)', 'rgba(255, 193, 7, 1)'
      ],

      components: {
        preview: true,
        opacity: true,
        hue: true,

        interaction: {
          rgba: true,
          hsla: true,
          cmyk: false,
          input: true
        }
      }
    });

    pickr.on('change', (color, instance) => {
      const rgba = color.toHEXA();
      const rgbString = rgba.toString().substr(0, 7);
      this.handlePenColorChange(rgbString, color.toRGBA()[3]);
      instance.applyColor();
    });
  }

  render() {
    return (
      <div id="ui" className={this.state.leftyUi ? 'overlay lefty' : 'overlay'}>
        <button onClick={() => this.handleToolChange('Pen')} className={(this.state.selectedTool === 'Pen' ? 'pen-btn active' : 'pen-btn')}>ペン</button>
        <button onClick={() => this.handleToolChange('Eraser')} className={(this.state.selectedTool === 'Eraser' ? 'eraser-btn active' : 'eraser-btn')}>消しゴム</button>
        <button onClick={this.undo}>元に戻す</button>
        <button onClick={this.download}>ダウンロード</button>
        <div className="color-picker"></div>
      
        <div>
          <div>ペンの太さ: {this.state.penThicknessCoefficient}</div>
          <input onChange={e => this.penThicknessChange(parseInt(e.target.value))} defaultValue={this.state.penThicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
        
        <div>
          <div>消しゴムの太さ: {this.state.eraserThicknessCoefficient}</div>
          <input onChange={e => this.eraserThicknessChange(parseInt(e.target.value))} defaultValue={this.state.eraserThicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
        
        <div>
          <input onChange={e => this.leftyChange(e.target.checked)} type="checkbox"></input>左利き
        </div>
      </div>
    );
  }
}

export default ToolBox;
