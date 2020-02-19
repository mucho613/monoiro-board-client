class Tool {
  displayName;
  color;
  alpha;
  thicknessCoefficient;

  constructor(type, displayName, color, alpha, thicknessCoefficient) {
    this.type = type;
    this.displayName = displayName;
    this.color = color;
    this.alpha = alpha;
    this.thicknessCoefficient = thicknessCoefficient;
  }

  setColor(value) {
    this.color = value;
  }

  setAlpha(value) {
    this.alpha = value;
  }

  setThicknessCoefficient(value) {
    this.thicknessCoefficient = value;
  }
}

export default Tool;
