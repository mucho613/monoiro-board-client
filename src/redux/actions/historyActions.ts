import { HistoryActionTypes } from './actionTypes';
import Step from '../../types/step';

export const setQueue = (queue: Array<Step>) => {
  return {
    type: HistoryActionTypes.SET_QUEUE,
    payload: queue
  }
}

export const setFixedCanvas = (fixedCanvas: HTMLCanvasElement) => {
  return {
    type: HistoryActionTypes.SET_FIXED_CANVAS,
    payload: fixedCanvas
  }
}

export const undo = (userId: string) => {
  return {
    type: HistoryActionTypes.UNDO,
    payload: { userId }
  }
}

export const redo = (userId: string) => {
  return {
    type: HistoryActionTypes.REDO,
    payload: { userId }
  }
}

export const stepStart = (data: any) => {
  return {
    type: HistoryActionTypes.STEP_START,
    payload: { data }
  }
}

export const stepUpdate = (data: any) => {
  return {
    type: HistoryActionTypes.STEP_START,
    payload: { data }
  }
}

export const stepEnd = (data: any) => {
  return {
    type: HistoryActionTypes.STEP_START,
    payload: { data }
  }
}

