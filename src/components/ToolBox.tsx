import React from "react";

import "../css/ToolBox.css";

import { connect } from "react-redux";

import { setUsingTool } from "../redux/actions/userActions";
import { setTool } from "../redux/actions/toolActions";
import { undo } from "../redux/actions/historyActions";

const ToolBox = () => {
  return (
    <div className={"tool-box"}>
      <button
        onClick={() => setUsingTool("pen")}
        className={"pen-btn active"}
        >
        ペン
      </button>
      <button onClick={() => undo()}>元に戻す</button>
      <div className="color-picker"></div>
    </div>
  );
}

export default connect(
  null,
  { undo, setUsingTool, setTool }
)(ToolBox);
