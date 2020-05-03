import React from "react";

import CanvasController from "./CanvasController";
import ToolBox from "./ToolBox";

import "../css/App.css";
import { Tool, Tools } from "../modules/Tool";

interface Props {
  selectedTool: Tool;
  tools: Tools;
  onToolChange: (tools: Tools) => void;
  onSelectedToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onDownload: () => void;

  onStrokeStart: () => void;
  onStrokeMove: (x: number, y: number, force: number) => void;
  onStrokeEnd: () => void;
}

function Controller(props: Props) {
  return (
    <div className="controller">
      <ToolBox
        selectedTool={props.selectedTool}
        tools={props.tools}
        onToolChange={props.onToolChange}
        onSelectedToolChange={props.onSelectedToolChange}
        onUndo={props.onUndo}
        onDownload={props.onDownload}
      />
      <CanvasController
        onStrokeStart={props.onStrokeStart}
        onStrokeMove={props.onStrokeMove}
        onStrokeEnd={props.onStrokeEnd}
      />
    </div>
  );  
}

export default Controller;
