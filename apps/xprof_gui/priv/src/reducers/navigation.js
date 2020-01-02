import { without } from 'lodash';
import * as types from '../constants/ActionTypes';
import { INPUT_TYPE } from '../constants';

const initialState = {
  query: '',
  dirtyInput: '',
  expansion: '',
  functions: [],
  position: -1,
  language: null,
  inputType: null,
  example: null,
  history: [],
  favourites: [],
  selectedInputType: INPUT_TYPE.SEARCH,
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
        expansion: '',
        functions: [],
        position: -1,
      };
    case types.SET_POSITION:
      return {
        ...state,
        position: action.position,
      };
    case types.FILL_AUTOCOMPLETER_MATCHES:
      return {
        ...state,
        expansion: action.expansion,
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
    case types.SWITCH_INPUT_TYPE:
      return {
        ...state,
        selectedInputType: action.inputType,
      };
    case types.UPDATE_FAVOURITES:
      return {
        ...state,
        favourites: action.favourites,
      };
    default:
      return state;
  }
};

export default navigation;
