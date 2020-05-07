import { UserActionTypes } from './actionTypes';
 
export const setUsingTool = (toolId: string) => {
  return {
    type: UserActionTypes.SET_USING_TOOL,
    payload: {
      toolId: toolId
    }
  }
};
