import React from "react";
import "../css/Canvas.css";
import CanvasPiece from "./CanvasPiece";
import { connect } from "react-redux";

const InfinityCanvas = () => {
  const canvasWidth = 2048;
  const canvasHeight = 2048;
  return (
    <div className="canvas">
      <CanvasPiece
        fixedImage={}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
    </div>
  );
}

const mapStateToProps = 

export default connect(mapStateToProps)(InfinityCanvas);
