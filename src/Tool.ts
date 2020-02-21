export enum ToolType {
  Pen,
  Eraser
}

export class Tool {
  type: ToolType;
  displayName: string;
  color: string;
  alpha: number;
  thicknessCoefficient: number;

  /**
   * ツールを生成する
   * @param {ToolType} type ツールの種別
   * @param {string} displayName ToolBox での表示名
   * @param {string} color 色(#xxxxxx 形式)
   * @param {number} alpha 透明度(0.0～1.0)
   * @param {number} thicknessCoefficient ツールに対する太さ設定
   * @memberof Tool
   */
  constructor(
    type: ToolType,
    displayName: string,
    color: string,
    alpha: number,
    thicknessCoefficient: number
  ) {
    this.type = type;
    this.displayName = displayName;
    this.color = color;
    this.alpha = alpha;
    this.thicknessCoefficient = thicknessCoefficient;
  }

  /**
   * Tool に色をセットする
   *
   * @param {string} value
   * @memberof Tool
   */
  setColor(value: string) {
    this.color = value;
  }

  /**
   * Tool に描画時の透明度をセットする(0～1)
   *
   * @param {number} value
   * @memberof Tool
   */
  setAlpha(value: number) {
    this.alpha = value;
  }

  setThicknessCoefficient(value: number) {
    this.thicknessCoefficient = value;
  }
}

export class Tools {
  private _tools: Map<string, Tool>;

  constructor(tools: Map<string, Tool>) {
    this._tools = tools;
  }

  getById(id: string): Tool {
    const tool = this._tools.get(id);
    if (!tool) throw new Error("対象の Tool を取得できません");
    return tool;
  }
}
