import React from "react";
import io from "socket.io-client";
import "./App.css";
import Controller from "./Controller";
import History from "./History";
import InfinityCanvas from "./InfinityCanvas";
import { Tool, Tools, ToolType } from "./Tool";

interface States {
  id: string;
  tools: Tools;
  selectedTool: Tool;

  fixedImage: HTMLCanvasElement | HTMLImageElement;
  historyQueue: Array<any>;
}

class App extends React.Component<{}, States> {
  historyQueueMaxLength = 5;
  socket: SocketIOClient.Socket;
  history: History;
  infinityCanvas: React.RefObject<InfinityCanvas>;

  constructor(props: {}) {
    super(props);

    this.infinityCanvas = React.createRef<InfinityCanvas>();

    this.socket = io.connect("https://mucho613.space:8081");

    this.history = new History(
      this.historyQueueMaxLength,
      this.socket,
      this.handleUpdateCanvas
    );

    const tools: Tools = new Tools(
      new Map([
        ["pen", new Tool(ToolType.Pen, "ペン", "#555555", 1.0, 16)],
        ["eraser", new Tool(ToolType.Eraser, "消しゴム", "#ffffff", 1.0, 64)]
      ])
    );

    this.state = {
      id: "",
      tools: tools,
      selectedTool: tools.getById("pen"),
      fixedImage: new Image(2048, 2048),
      historyQueue: []
    };

    this.socket.on("init", (initializeData: { [key: string]: Array<any> }) => {
      this.socket.emit("request fixed image");

      this.setState({
        id: this.socket.id,
        historyQueue: this.history.setQueue(initializeData.historyQueue)
      });
    });

    this.socket.on("fixed image", (base64: string) => {
      const image = new Image();
      image.src = base64;
      setTimeout(() => this.setState({ fixedImage: this.history.setFixedImage(image) }), 0);
    });
  }

  componentDidMount() {
    window.addEventListener(
      "pageshow",
      e => e.persisted && window.location.reload()
    );
  }
  handleActionStart = () => {
    this.history.localActionStart(Object.assign({}, this.state.selectedTool));
  };
  handleActionUpdate = (x: number, y: number, force: number) => {
    this.history.localActionUpdate({ x: x, y: y, force: force });
  };
  handleActionEnd = () => {
    this.history.localActionEnd();
  };
  handleUndo = () => {
    this.history.localUndo();
  };
  handleDownload = () => {
    const base64 = this.history.fixedImageCanvas.toDataURL();
    const newWindow = window.open();
    newWindow?.document.write(
      '<img src="' +
        base64 +
        '" style="width:100%; height:100%; object-fit: contain;"></img>'
    );
  };

  handleToolChange = (tools: Tools) => this.setState({ tools: tools });
  handleSelectedToolChange = (tool: Tool) => this.setState({ selectedTool: tool });

  handleUpdateCanvas = (fixedImage: HTMLCanvasElement, historyQueue: Array<any>) => {
    this.setState({
      fixedImage: fixedImage,
      historyQueue: historyQueue
    });
  }

  render() {
    return (
      <div className="App">
        <Controller
          selectedTool={this.state.selectedTool}
          tools={this.state.tools}
          onToolChange={this.handleToolChange}
          onSelectedToolChange={this.handleSelectedToolChange}
          onUndo={this.handleUndo}
          onDownload={this.handleDownload}
          onStrokeStart={this.handleActionStart}
          onStrokeMove={this.handleActionUpdate}
          onStrokeEnd={this.handleActionEnd}
        />

        <InfinityCanvas
          ref={this.infinityCanvas}
          selectedTool={this.state.selectedTool}
          fixedImage={this.state.fixedImage}
          historyQueue={this.state.historyQueue}
        />
      </div>
    );
  }
}

export default App;
