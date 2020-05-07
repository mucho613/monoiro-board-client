import { Tool, ToolType } from "../types/tool";

class History {
  queue: Array<any>;
  queueMaxLength: number;
  fixedImageCanvas: HTMLCanvasElement;
  fixedImageCanvasContext: CanvasRenderingContext2D;

  constructor(
    queueMaxLength: number,
  ) {
    this.queueMaxLength = queueMaxLength;
    this.queue = [];

    this.fixedImageCanvas = document.createElement("canvas");
    this.fixedImageCanvas.width = 2048;
    this.fixedImageCanvas.height = 2048;

    const context = this.fixedImageCanvas.getContext("2d");
    if (!context) throw new Error("fixed image canvas が初期化できない");
    this.fixedImageCanvasContext = context;
  }

  setFixedImage = (image: HTMLImageElement): HTMLCanvasElement => {
    this.fixedImageCanvasContext.drawImage(image, 0, 0);
    return this.fixedImageCanvas;
  };

  setQueue = (queue: Array<any>) => {
    // image が入ってないかもしれないので、ここで全部 image を作る
    for (let i = 0; i < queue.length; i++) {
      const step = queue[i];

      if (step.image === null && step.stroke.length > 1) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("fixed image canvas が初期化できない");

        const width = step.right - step.left;
        const height = step.bottom - step.top;

        canvas.width = width;
        canvas.height = height;

        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = step.tool.color;

        for (let i = 1; i < step.stroke.length; i++) {
          const previousPoint = step.stroke[i - 1];
          const point = step.stroke[i];
          const thickness = point.force * step.tool.thicknessCoefficient;

          context.beginPath();
          context.lineWidth = thickness;
          context.moveTo(
            previousPoint.x - step.left,
            previousPoint.y - step.top
          );
          context.lineTo(point.x - step.left, point.y - step.top);
          context.stroke();
        }

        step.image = canvas;
      }
    }

    return (this.queue = queue);
  };

  stepStart = (id: string, tool: Tool) => {
    const step = {
      isActive: true,
      id: id,
      tool: tool,
      stroke: [],
      image: null,
      left: 2048,
      right: 0,
      top: 2048,
      bottom: 0
    };

    // History に操作を追加する
    this.queue.push(step);

    if (this.queue.length > this.queueMaxLength) {
      const step = this.queue.shift();

      // Undo されていない Step だけ FixedImageCanvas に描き込む
      if (step.isActive) {
        this.fixedImageCanvasContext.globalCompositeOperation =
          step.tool.type === ToolType.Pen ? "source-over" : "destination-out";

        if (step.image) {
          this.fixedImageCanvasContext.globalAlpha = step.tool.alpha;
          this.fixedImageCanvasContext.drawImage(
            step.image,
            step.left,
            step.top
          );
        }
        // HistoryQueue の終端に Step があるのに、もしも image 変換されてなかった場合は、
        // 即時的な canvas に描画してから fixedImageCanvas に描画する
        // (fixedImageCanvasContext で描画すると半透明線をうまく扱えないため)
        else if (step.stroke.length > 1) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("canvas が初期化できない");

          const width = step.right - step.left;
          const height = step.bottom - step.top;

          canvas.width = width;
          canvas.height = height;

          context.clearRect(0, 0, width, height);

          context.lineCap = "round";
          context.lineJoin = "round";
          context.strokeStyle = step.tool.color;

          for (let i = 1; i < step.stroke.length; i++) {
            const previousPoint = step.stroke[i - 1];
            const point = step.stroke[i];
            const thickness = point.force * step.tool.thicknessCoefficient;

            context.beginPath();
            context.lineWidth = thickness;
            context.moveTo(
              previousPoint.x - step.left,
              previousPoint.y - step.top
            );
            context.lineTo(point.x - step.left, point.y - step.top);
            context.stroke();
          }

          this.fixedImageCanvasContext.globalAlpha = 1.0;
          this.fixedImageCanvasContext.drawImage(
            canvas,
            step.left,
            step.top
          );
        }
      }
    }

    console.log("Step Start", this.queue);
  };

  stepUpdate = (id: string, point: any) => {
    // 直近の対象idの操作を検索して、取り出す
    const step = this.getLatestStepById(id);

    if (step) {
      // Step に Stroke を追加する
      step.stroke.push(point);

      const thickness = point.force * step.tool.thicknessCoefficient;

      const left = point.x - thickness;
      const right = point.x + thickness;
      const top = point.y - thickness;
      const bottom = point.y + thickness;

      if (step.left > left) step.left = left;
      if (step.right < right) step.right = right;
      if (step.top > top) step.top = top;
      if (step.bottom < bottom) step.bottom = bottom;

      if (step.left < 0) step.left = 0;
      if (step.right > 2048) step.right = 2048;
      if (step.top < 0) step.top = 0;
      if (step.bottom > 2048) step.bottom = 2048;
    }
  };

  stepEnd = (id: string) => {
    const step = this.getLatestStepById(id);

    if (step && step.stroke.length > 1) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas が初期化できない");

      const width = step.right - step.left;
      const height = step.bottom - step.top;

      canvas.width = width;
      canvas.height = height;

      context.clearRect(0, 0, width, height);

      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = step.tool.color;

      for (let i = 1; i < step.stroke.length; i++) {
        const previousPoint = step.stroke[i - 1];
        const point = step.stroke[i];
        const thickness = point.force * step.tool.thicknessCoefficient;

        context.beginPath();
        context.lineWidth = thickness;
        context.moveTo(
          previousPoint.x - step.left,
          previousPoint.y - step.top
        );
        context.lineTo(point.x - step.left, point.y - step.top);
        context.stroke();
      }

      step.image = canvas;
    }

    console.log("Step End", this.queue);
  };

  undo = (id: string) => {
    const step = this.getLatestStepById(id);
    if (step) step.isActive = false;
    return step;
  };

  getLatestStepById = (id: string) => {
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const step = this.queue[i];
      if (step.id === id && step.isActive) return this.queue[i];
    }
    return this.queue[0];
  };
}

export default History;
