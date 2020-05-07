import React from "react";

import CanvasController from "./CanvasController";
import ToolBox from "./ToolBox";

import "../css/App.css";

const Controller = () => {
  return (
    <div className="controller">
      <ToolBox />
      <CanvasController />
    </div>
  );  
}

export default Controller;
