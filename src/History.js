class History {
  queue = [];
  queueMaxLength;
  socket = null;
  destinationCanvas;
  destinationCanvasContext;
  temporaryCanvas;
  temporaryCanvasContext;

  constructor(queueMaxLength, socket) {
    this.queueMaxLength = queueMaxLength;
    this.socket = socket;

    // 他のユーザーの操作
    this.socket.on('action start', (id, tool) => {
      this.actionStart(id, tool);
    });

    this.socket.on('action update', (id, line) => {
      this.actionUpdate(id, line);
    });

    this.socket.on('action end', id => {
      this.actionEnd(id);
    });

    this.socket.on('undo', id => {
      this.undo(id);
    });

    this.destinationCanvas = document.createElement('canvas');
    this.destinationCanvas.width = 2048;
    this.destinationCanvas.height = 2048;
    this.destinationCanvasContext = this.destinationCanvas.getContext('2d');

    // this.temporaryCanvas = document.createElement('canvas');
    // this.temporaryCanvasContext = this.temporaryCanvas.getContext('2d');
  }

  // 自分の操作
  localActionStart = tool => {
    this.actionStart(this.socket.id, tool);
    this.socket.emit('action start', tool);
  }

  localActionUpdate = attribute => {
    this.actionUpdate(this.socket.id, attribute);
    this.socket.emit('action update', attribute);
  }

  localActionEnd = () => {
    this.actionEnd(this.socket.id);
    this.socket.emit('action end');
  }

  localUndo = () => {
    this.undo(this.socket.id);
    this.socket.emit('undo');
  }

  actionStart = (id, tool) => {
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

    if(this.queue.length > this.queueMaxLength) {
      const action = this.queue.shift();

      if(action.isActive) {
        this.destinationCanvasContext.globalAlpha = action.tool.alpha;
        this.destinationCanvasContext.globalCompositeOperation = action.tool.type === 'pen'
          ? 'source-over'
          : 'destination-out';

        if(action.image) {
          this.destinationCanvasContext.drawImage(action.image, action.left, action.top);
        }
        // HistoryQueue の終端に Action があるのに、もしも image 変換されてなかった場合は、
        // 即時的な canvas に描画してから destinationCanvas に描画する
        // (destinationCanvasContext で描画すると半透明線をうまく扱えないため)
        else if(action.stroke.length > 1) {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          const width = action.right - action.left;
          const height = action.bottom - action.top;
          context.width = width;
          context.height = height;
          context.clearRect(0, 0, width, height);
    
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = action.tool.color;
    
          for(let i = 1; i < action.stroke.length; i++) {
            const previousPoint = action.stroke[i - 1];
            const point = action.stroke[i];
            const thickness = point.force * action.tool.thicknessCoefficient;
            
            context.beginPath();
            context.lineWidth = thickness;
            context.moveTo(previousPoint.x - action.left, previousPoint.y - action.top);
            context.lineTo(point.x - action.left, point.y - action.top);
            context.stroke();
          }
    
          this.context.drawImage(this.temporaryCanvas, action.left, action.top);
        }
      }
    }

    console.log('Action Start', this.queue);
  }

  actionUpdate = (id, point) => {
    // 直近の対象idの操作を検索して、取り出す
    const action = this.queue[this.getLatestActionIndexById(id)];

    if(action) {
      // Action に Stroke を追加する
      action.stroke.push(point);

      const thickness = point.force * action.tool.thicknessCoefficient

      const left = point.x - thickness;
      const right = point.x + thickness;
      const top = point.y - thickness;
      const bottom = point.y + thickness;

      if(action.left > left) action.left = left;
      if(action.right < right) action.right = right;
      if(action.top > top) action.top = top;
      if(action.bottom < bottom) action.bottom = bottom;

      if(action.left < 0) action.left = 0;
      if(action.right > 2048) action.right = 2048;
      if(action.top < 0) action.top = 0;
      if(action.bottom > 2048) action.bottom = 2048;
    }
  }

  actionEnd = id => {
    const action = this.queue[this.getLatestActionIndexById(id)];

    if(action && action.stroke.length > 1) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const width = action.right - action.left;
      const height = action.bottom - action.top;
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);

      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = action.tool.color;

      for(let i = 1; i < action.stroke.length; i++) {
        const previousPoint = action.stroke[i - 1];
        const point = action.stroke[i];
        const thickness = point.force * action.tool.thicknessCoefficient;
        
        context.beginPath();
        context.lineWidth = thickness;
        context.moveTo(previousPoint.x - action.left, previousPoint.y - action.top);
        context.lineTo(point.x - action.left, point.y - action.top);
        context.stroke();
      }

      action.image = canvas;
    }

    console.log('Action End', this.queue);
  }

  undo = id => {
    const action = this.queue[this.getLatestActionIndexById(id)];
    if(action) action.isActive = false;
    return action;
  }
  
  getLatestActionIndexById = id => {
    for(let i = this.queue.length - 1; i >= 0; i--) {
      if(this.queue[i].id === id && this.queue[i].isActive) return i;
    }
  }

  getQueue = () => {
    return [{
      isActive: true,
      id: 'Unundoable Destination Layer',
      tool: { type: 'destinationcanvas', alpha: 1.0 },
      image: this.destinationCanvas,
      left: 0,
      right: 2048,
      top: 0,
      bottom: 2048
    }].concat(this.queue);
  }
}

export default History;
