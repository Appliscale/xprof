import * as types from '../constants/ActionTypes';

const initialState = {
  query: '',
  functions: [],
  position: -1,
  error: false,
};

const navigation = (state = initialState, action) => {
  switch (action.type) {
    case types.QUERY_INPUT_CHANGE:
      return {
        ...state,
        query: action.query,
        error: false,
      };
    case types.CLEAR_FUNCTION_BROWSER:
      return {
        ...state,
        query: '',
        functions: [],
        error: false,
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
        error: false,
      };
    case types.NO_SUCH_FUNCTION_ERROR:
      return {
        ...state,
        error: true,
      };

    default:
      return state;
  }
};

export default navigation;
