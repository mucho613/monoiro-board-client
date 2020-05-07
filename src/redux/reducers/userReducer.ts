import { UserActionTypes } from '../actions/actionTypes';
import { UserState } from '../states/UserState';
 
export const initialUserState: UserState = {
  usingTool: "pen"
}

export const UserReducer = (state: UserState = initialUserState, action: any): UserState => {
  switch (action.type) {
    case UserActionTypes.SET_USING_TOOL: {
      return {
        usingTool: action.payload.toolId
      };
    }
    default: {
      return state;
    }
  }
}
