import { ToolActionTypes } from '../actions/actionTypes';
import { Tool, ToolType } from '../../types/tool';
import { ToolState } from '../states/ToolState';
 
export const initialToolState: ToolState = {
  tools: new Map([
    ["pen", new Tool(ToolType.Pen, "ペン", "#555555", 1.0, 16)],
    ["eraser", new Tool(ToolType.Eraser, "消しゴム", "#ffffff", 1.0, 64)]
  ])
}

export const ToolReducer = (state: ToolState = initialToolState, action: any): ToolState => {
  switch (action.type) {
    case ToolActionTypes.SET_TOOL: {
      return {
        tools: state.tools.set(action.payload.toolId, action.payload.data)
      };
    }
    default: {
      return state;
    }
  }
}
