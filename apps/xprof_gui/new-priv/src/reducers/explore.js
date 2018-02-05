import * as types from '../constants/ActionTypes';

const initialState = {
  callees: {},
  visibility: {},
};

const explore = (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_CALLEES:
      return {
        ...state,
        callees: {
          ...state.callees,
          ...action.callees,
        },
      };
    case types.SHOW_FUNCTIONS_CALLES:
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.functionName]: true,
        },
      };
    case types.HIDE_FUNCTIONS_CALLES:
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.functionName]: false,
        },
      };
    default:
      return state;
  }
};

export default explore;
