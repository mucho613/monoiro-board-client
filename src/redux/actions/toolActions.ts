import { ToolActionTypes } from './actionTypes';
import { Tool } from '../../types/tool';
 
export const setTool = (toolId: string, data: Tool) => {
  return {
    type: ToolActionTypes.SET_TOOL,
    payload: { toolId, data }
  }
}
