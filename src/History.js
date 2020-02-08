import TemporaryCanvas from './TemporaryCanvas'

class History {
  queue = [];
  queueMaxLength = null;
  socket = null;

  constructor(queueMaxLength, socket) {
    this.queueMaxLength = queueMaxLength;
    this.socket = socket;

    // 他のユーザーの操作
    this.socket.on('action start', (id, tool, penColor, alpha) => {
      this.actionStart(id, tool, penColor, alpha);
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
  localActionStart = (tool, penColor, alpha) => {
    this.actionStart(this.socket.id, tool, penColor, alpha);
    this.socket.emit('action start', tool, penColor, alpha);
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

  actionStart = (id, tool, color, alpha) => {
    const action = {
      isActive: true,
      id: id,
      stroke: [],
      actionType: tool,
      canvas: new TemporaryCanvas({ color: color, alpha: alpha }),
      image: null,
      color: color,
      alpha: alpha,
      left: null,
      right: null,
      top: null,
      bottom: null,
    };

    this.queue.push(action);
    console.log('Action Start', this.queue);
  }

  actionUpdate = (id, line) => {
    const action = this.queue[this.getLatestActionIndexById(id)]
    if(action.stroke.length > 1) {
      action.stroke.push(line);
      action.canvas.strokeAdd({
        x1: action.stroke[action.stroke.length - 2].x,
        y1: action.stroke[action.stroke.length - 2].y,
        x2: line.x,
        y2: line.y,
        thickness: line.thickness
      });
    }

    if(action.left === null) {
      const left = line.x - line.thickness;
      const right = line.x + line.thickness;
      const top = line.y - line.thickness;
      const bottom = line.y + line.thickness;

      if(action.left > left) action.left = left;
      if(action.right < right) action.right = right;
      if(action.top > top) action.top = top;
      if(action.bottom < bottom) action.bottom = bottom;
    }
  }

  actionEnd = id => {
    const action = this.queue[this.getLatestActionIndexById(id)];
    const image = new Image(action.right - action.left, action.bottom - action.top);
    image.src = action.canvas.getImageBase64();
    action.image = image;
    console.log('Action End', this.queue);
  }

  undo = id => {
    const action = this.queue[this.getLatestActionIndexById(id)];
    action.isActive = false;
    console.log("Undo", this.queue);
    return action;
  }
  
  getLatestActionIndexById = id => {
    for(let i = this.queue.length - 1; i >= 0; i--) {
      if(this.queue[i].id === id) return i;
    }
  }

  getQueue = () => this.queue;
}

export default History;
