import { Tool, ToolType } from "./Tool";

/**
 * 現在の描画内容(Undo 可能な有限個の操作と、その領域からはみ出して確定した描画となった画像)を管理する
 * 描画内容サーバーと自動で同期される
 *
 * @class History
 */
class History {
  queue: any[];
  queueMaxLength: number;
  socket: SocketIOClient.Socket;
  fixedImageCanvas: HTMLCanvasElement;
  fixedImageCanvasContext: CanvasRenderingContext2D;
  onUpdateCanvas: Function;

  constructor(
    queueMaxLength: number,
    socket: SocketIOClient.Socket,
    onUpdateCanvas: Function
  ) {
    this.queueMaxLength = queueMaxLength;
    this.socket = socket;
    this.queue = [];
    this.onUpdateCanvas = onUpdateCanvas;

    // 他のユーザーの操作
    this.socket.on("action start", (id: string, tool: any) => {
      this.actionStart(id, tool);
      // 特に必要なし
      // this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
    });

    this.socket.on("action update", (id: string, line: any) => {
      this.actionUpdate(id, line);
      this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
    });

    this.socket.on("action end", (id: string) => {
      this.actionEnd(id);
      // 特に必要なし
      // this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
    });

    this.socket.on("undo", (id: string) => {
      this.undo(id);
      this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
    });

    this.fixedImageCanvas = document.createElement("canvas");
    this.fixedImageCanvas.width = 2048;
    this.fixedImageCanvas.height = 2048;

    const context = this.fixedImageCanvas.getContext("2d");
    if (!context) throw new Error("fixed image canvas が初期化できない");
    this.fixedImageCanvasContext = context;
  }

  // 自分の操作
  localActionStart = (tool: Tool) => {
    this.socket.emit("action start", tool);
    this.actionStart(this.socket.id, tool);
    // 特に必要なし
    // this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
  };

  localActionUpdate = (attribute: any) => {
    this.socket.emit("action update", attribute);
    this.actionUpdate(this.socket.id, attribute);
    this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
  };

  localActionEnd = () => {
    this.socket.emit("action end");
    this.actionEnd(this.socket.id);
    // 特に必要なし
    // this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
  };

  localUndo = () => {
    this.socket.emit("undo");
    this.undo(this.socket.id);
    this.onUpdateCanvas(this.fixedImageCanvas, this.queue);
  };

  setFixedImage = (image: HTMLImageElement): HTMLCanvasElement => {
    this.fixedImageCanvasContext.drawImage(image, 0, 0);
    return this.fixedImageCanvas;
  };

  setQueue = (queue: Array<any>) => {
    // image が入ってないかもしれないので、ここで全部 image を作る
    for (let i = 0; i < queue.length; i++) {
      const action = queue[i];

      if (action.image === null && action.stroke.length > 1) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("fixed image canvas が初期化できない");

        const width = action.right - action.left;
        const height = action.bottom - action.top;

        canvas.width = width;
        canvas.height = height;

        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = action.tool.color;

        for (let i = 1; i < action.stroke.length; i++) {
          const previousPoint = action.stroke[i - 1];
          const point = action.stroke[i];
          const thickness = point.force * action.tool.thicknessCoefficient;

          context.beginPath();
          context.lineWidth = thickness;
          context.moveTo(
            previousPoint.x - action.left,
            previousPoint.y - action.top
          );
          context.lineTo(point.x - action.left, point.y - action.top);
          context.stroke();
        }

        action.image = canvas;
      }
    }

    return (this.queue = queue);
  };

  actionStart = (id: string, tool: Tool) => {
    // Action のひな形
    const action = {
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
    this.queue.push(action);

    if (this.queue.length > this.queueMaxLength) {
      const action = this.queue.shift();

      // Undo されていない Action だけ FixedImageCanvas に描き込む
      if (action.isActive) {
        this.fixedImageCanvasContext.globalCompositeOperation =
          action.tool.type === ToolType.Pen ? "source-over" : "destination-out";

        if (action.image) {
          this.fixedImageCanvasContext.globalAlpha = action.tool.alpha;
          this.fixedImageCanvasContext.drawImage(
            action.image,
            action.left,
            action.top
          );
        }
        // HistoryQueue の終端に Action があるのに、もしも image 変換されてなかった場合は、
        // 即時的な canvas に描画してから fixedImageCanvas に描画する
        // (fixedImageCanvasContext で描画すると半透明線をうまく扱えないため)
        else if (action.stroke.length > 1) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("canvas が初期化できない");

          const width = action.right - action.left;
          const height = action.bottom - action.top;

          canvas.width = width;
          canvas.height = height;

          context.clearRect(0, 0, width, height);

          context.lineCap = "round";
          context.lineJoin = "round";
          context.strokeStyle = action.tool.color;

          for (let i = 1; i < action.stroke.length; i++) {
            const previousPoint = action.stroke[i - 1];
            const point = action.stroke[i];
            const thickness = point.force * action.tool.thicknessCoefficient;

            context.beginPath();
            context.lineWidth = thickness;
            context.moveTo(
              previousPoint.x - action.left,
              previousPoint.y - action.top
            );
            context.lineTo(point.x - action.left, point.y - action.top);
            context.stroke();
          }

          this.fixedImageCanvasContext.globalAlpha = 1.0;
          this.fixedImageCanvasContext.drawImage(
            canvas,
            action.left,
            action.top
          );
        }
      }
    }

    console.log("Action Start", this.queue);
  };

  actionUpdate = (id: string, point: any) => {
    // 直近の対象idの操作を検索して、取り出す
    const action = this.getLatestActionById(id);

    if (action) {
      // Action に Stroke を追加する
      action.stroke.push(point);

      const thickness = point.force * action.tool.thicknessCoefficient;

      const left = point.x - thickness;
      const right = point.x + thickness;
      const top = point.y - thickness;
      const bottom = point.y + thickness;

      if (action.left > left) action.left = left;
      if (action.right < right) action.right = right;
      if (action.top > top) action.top = top;
      if (action.bottom < bottom) action.bottom = bottom;

      if (action.left < 0) action.left = 0;
      if (action.right > 2048) action.right = 2048;
      if (action.top < 0) action.top = 0;
      if (action.bottom > 2048) action.bottom = 2048;
    }
  };

  actionEnd = (id: string) => {
    const action = this.getLatestActionById(id);

    if (action && action.stroke.length > 1) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas が初期化できない");

      const width = action.right - action.left;
      const height = action.bottom - action.top;

      canvas.width = width;
      canvas.height = height;

      context.clearRect(0, 0, width, height);

      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = action.tool.color;

      for (let i = 1; i < action.stroke.length; i++) {
        const previousPoint = action.stroke[i - 1];
        const point = action.stroke[i];
        const thickness = point.force * action.tool.thicknessCoefficient;

        context.beginPath();
        context.lineWidth = thickness;
        context.moveTo(
          previousPoint.x - action.left,
          previousPoint.y - action.top
        );
        context.lineTo(point.x - action.left, point.y - action.top);
        context.stroke();
      }

      action.image = canvas;
    }

    console.log("Action End", this.queue);
  };

  undo = (id: string) => {
    const action = this.getLatestActionById(id);
    if (action) action.isActive = false;
    return action;
  };

  getLatestActionById = (id: string) => {
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const action = this.queue[i];
      if (action.id === id && action.isActive) return this.queue[i];
    }
    return this.queue[0];
  };
}

export default History;
