import { without } from 'lodash';
import * as types from '../constants/ActionTypes';

const initialState = {
  query: '',
  dirtyInput: '',
  functions: [],
  position: -1,
  language: null,
  inputType: null,
  example: null,
  history: [],
};

const navigation = (state = initialState, action) => {
  switch (action.type) {
    case types.QUERY_INPUT_CHANGE:
      return {
        ...state,
        query: action.query,
      };
    case types.CLEAR_FUNCTION_BROWSER:
      return {
        ...state,
        query: '',
        functions: [],
      };
    case types.SET_POSITION:
      return {
        ...state,
        position: action.position,
      };
    case types.FILL_AUTOCOMPLETER_FUNCTIONS:
      return {
        ...state,
        functions: action.functions,
      };
    case types.SET_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    case types.SET_TYPE:
      return {
        ...state,
        inputType: action.inputType,
      };
    case types.SET_EXAMPLE:
      return {
        ...state,
        example: action.example,
      };
    case types.ADD_RECENT_QUERY:
      return {
        ...state,
        history: [...without(state.history, action.query), action.query],
      };
    case types.SAVE_DIRTY_INPUT:
      return {
        ...state,
        dirtyInput: action.query,
      };
    default:
      return state;
  }
};

export default navigation;
