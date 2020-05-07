import { combineReducers } from "redux";
import { ToolReducer } from "./toolReducer";
import { UserReducer } from "./userReducer";

export default combineReducers({ ToolReducer, UserReducer });
