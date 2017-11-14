import * as types from '../constants/ActionTypes';

const initialState = {
  capture: [],
};

const tracing = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_CAPTURE:
      return {
        ...state,
        capture: action.capture,
      };
    default:
      return state;
  }
};

export default tracing;
