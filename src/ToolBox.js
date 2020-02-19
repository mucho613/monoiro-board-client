import React from 'react';

import Pickr from '@simonwep/pickr/dist/pickr.es5.min';
import '@simonwep/pickr/dist/themes/nano.min.css';

import './ToolBox.css';

class ToolBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tools: props.tools
    }
  }

  handleToolChange = tools => this.props.onToolChange(tools);
  handleSelectedToolChange = tool => this.props.onSelectedToolChange(tool);

  handlePenColorChange = (color, alpha) => {
    const tools = this.state.tools;
    tools.pen.setColor(color);
    tools.pen.setAlpha(alpha);
    this.props.onToolChange(tools);
  }
  penThicknessChange = value => {
    const tools = this.state.tools;
    tools.pen.setThicknessCoefficient(value);
    this.props.onToolChange(tools);
  };
  eraserThicknessChange = value => {
    const tools = this.state.tools;
    tools.eraser.setThicknessCoefficient(value);
    this.props.onToolChange(tools);
  }
  handleUndo = () => this.props.onUndo();
  handleDownload = () => this.props.onDownload();

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
      <div className={'tool-box'}>
        <button onClick={() => this.handleSelectedToolChange(this.props.tools.pen)} className={(this.props.selectedTool === this.props.tools.pen ? 'pen-btn active' : 'pen-btn')}>ペン</button>
        <button onClick={() => this.handleSelectedToolChange(this.props.tools.eraser)} className={(this.props.selectedTool === this.props.tools.eraser ? 'eraser-btn active' : 'eraser-btn')}>消しゴム</button>
        <button onClick={this.handleUndo}>元に戻す</button>
        <button onClick={this.handleDownload}>ダウンロード</button>
        <div className="color-picker"></div>
      
        <div>
          <div>ペンの太さ: {this.props.tools.pen.thicknessCoefficient}</div>
          <input onChange={e => this.penThicknessChange(e.target.value)} defaultValue={this.props.tools.pen.thicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
        
        <div>
          <div>消しゴムの太さ: {this.props.tools.eraser.thicknessCoefficient}</div>
          <input onChange={e => this.eraserThicknessChange(e.target.value)} defaultValue={this.props.tools.eraser.thicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
      </div>
    );
  }
}

export default ToolBox;
