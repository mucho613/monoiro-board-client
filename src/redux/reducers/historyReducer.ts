import { HistoryActionTypes } from '../actions/actionTypes';
import { Tool, ToolType } from '../../types/tool';
import { HistoryState } from '../states/historyState';
import Step from '../../types/step';
import History from '../../modules/History'
 
export const initialHistoryState: HistoryState = {
  history: new History(100)
}

export const HistoryReducer = (state: HistoryState = initialHistoryState, action: any) => {
  switch (action.type) {
    case HistoryActionTypes.SET_QUEUE: {
      state.history.setQueue(action.payload.data);
      return {
        history: action.state
      };
    }
    case HistoryActionTypes.STEP_START: {
      state.history.stepStart(action.payload.userId, action.payload.data);
      return {
        history: action.state
      };
    }
    case HistoryActionTypes.STEP_UPDATE: {
      state.history.stepStart(action.payload.userId, action.payload.data);
      return {
        history: action.state
      };
    }
    case HistoryActionTypes.STEP_END: {
      state.history.stepEnd(action.payload.userId);
      return {
        history: action.state
      };
    }
    case HistoryActionTypes.UNDO: {
      state.history.undo(action.payload.userId);
      return {
        history: action.state
      };
    }
    // case HistoryActionTypes.REDO: {
    //   state.history.redo(action.payload.userId);
    //   return {
    //     history: action.state
    //   };
    // }
    default: {
      return {
        history: action.state
      };
    }
  }
}
