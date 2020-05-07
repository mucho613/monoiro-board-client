import React from "react";
import io from "socket.io-client";
import "../css/App.css";
import Controller from "./Controller";
import InfinityCanvas from "./InfinityCanvas";

interface States {
  id: string;
}

class App extends React.Component<{}, States> {
  socket: SocketIOClient.Socket;
  constructor(props: {}) {
    super(props);

    this.socket = io.connect("localhost:8080");
    this.state = {
      id: ""
    };

    this.socket.on("init", (initializeData: { [key: string]: Array<any> }) => {
      this.socket.emit("request fixed image");
      this.setState({
        id: this.socket.id,
      });
    });

    this.socket.on("fixed image", (base64: string) => {
      const image = new Image();
      image.src = base64;
      // setFixedImage
    });
  }

  render() {
    return (
      <div className="App">
        <Controller />
        <InfinityCanvas />
      </div>
    );
  }
}

export default App;
