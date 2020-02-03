import React from 'react';

import Pickr from '@simonwep/pickr/dist/pickr.es5.min';
import '@simonwep/pickr/dist/themes/nano.min.css';

class Toolbox extends React.Component {
  handleToolChange = tool => this.props.onToolChange(tool);
  handlePenColorChange = color => this.props.onPenColorChange(color);
  handlePenThicknessChange = thickness => this.props.onPenThicknessChange(thickness);
  handleEraserThicknessChange = thickness => this.props.onEraserThicknessChange(thickness);
  handleLeftyChange = isLefty => this.props.onLeftyChange(isLefty);
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
      this.handlePenColorChange(color.toHEXA().toString());
      instance.applyColor();
    });
  }

  render() {
    const selectedTool = this.props.toolState.selectedTool;
    const penThicknessCoefficient = this.props.toolState.penThicknessCoefficient;
    const eraserThicknessCoefficient = this.props.toolState.eraserThicknessCoefficient;
    const leftyUi = this.props.toolState.leftyUi;

    return (
      <div id="ui" className={leftyUi ? 'overlay lefty' : 'overlay'}>
        <button onClick={() => this.handleToolChange(1)} className={(selectedTool === 1 ? 'pen-btn active' : 'pen-btn')}>ペン</button>
        <button onClick={() => this.handleToolChange(2)} className={(selectedTool === 2 ? 'eraser-btn active' : 'eraser-btn')}>消しゴム</button>
        <button onClick={this.handleDownload}>ダウンロード</button>
        <div className="color-picker"></div>
      
        <div>
          <div>ペンの太さ: {penThicknessCoefficient}</div>
          <input onChange={e => this.handlePenThicknessChange(parseInt(e.target.value))} defaultValue={penThicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
        
        <div>
          <div>消しゴムの太さ: {eraserThicknessCoefficient}</div>
          <input onChange={e => this.handleEraserThicknessChange(parseInt(e.target.value))} defaultValue={eraserThicknessCoefficient} type="range" min="8" max="256"></input>
        </div>
        
        <div>
          <input onChange={e => this.handleLeftyChange(e.target.checked)} type="checkbox"></input>左利き
        </div>
      </div>
    );
  }
}

export default Toolbox;
