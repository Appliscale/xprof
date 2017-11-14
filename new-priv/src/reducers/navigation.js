import * as types from '../constants/ActionTypes';

const initialState = {
  query: '',
  key: null,
  functions: [],
  position: -1,
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
    default:
      return state;
  }
};

export default navigation;
