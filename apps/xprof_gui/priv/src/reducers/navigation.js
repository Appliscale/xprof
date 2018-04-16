import * as types from '../constants/ActionTypes';

const initialState = {
  query: '',
  functions: [],
  position: -1,
  language: null,
  inputType: null,
  example: null,
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
    default:
      return state;
  }
};

export default navigation;
