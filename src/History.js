import TemporaryCanvas from './TemporaryCanvas'

class History {
  queue = [];
  queueMaxLength = null;
  socket = null;

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
      canvas: new TemporaryCanvas({ tool: tool }),
      image: null,
      left: 2048,
      right: 0,
      top: 2048,
      bottom: 0
    };

    // History に操作を追加する
    this.queue.push(action);
    console.log('Action Start', this.queue);
  }

  actionUpdate = (id, point) => {
    // 直近の対象idの操作を検索して、取り出す
    const action = this.queue[this.getLatestActionIndexById(id)];

    if(action) {
      // Action に Stroke を追加する
      action.stroke.push(point);

      const thickness = point.force * action.tool.thicknessCoefficient

      if(action.stroke.length > 1) {
        action.canvas.strokeAdd({
          x1: action.stroke[action.stroke.length - 2].x,
          y1: action.stroke[action.stroke.length - 2].y,
          x2: point.x,
          y2: point.y,
          thickness: thickness
        });
      }

      const left = point.x - thickness;
      const right = point.x + thickness;
      const top = point.y - thickness;
      const bottom = point.y + thickness;

      // 最初の点でセットする
      if(action.left === null) {
        action.left = left;
        action.right = right;
        action.top = top;
        action.bottom = bottom;
      }

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

    createImageBitmap(action.canvas.getCanvasElement(), action.left, action.top, action.right - action.left, action.bottom - action.top)
      .then(imageBitmap => action.image = imageBitmap);

    console.log('Action End', this.queue);
  }

  undo = id => {
    const action = this.queue[this.getLatestActionIndexById(id)];
    if(action) {
      action.isActive = false;
      console.log("Undo", this.queue);
    } 
    return action;
  }
  
  getLatestActionIndexById = id => {
    for(let i = this.queue.length - 1; i >= 0; i--) {
      if(this.queue[i].id === id && this.queue[i].isActive) return i;
    }
  }

  getQueue = () => this.queue;
}

export default History;
