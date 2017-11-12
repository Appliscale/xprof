import * as types from '../constants/ActionTypes';

const initialState = {
  mfas: [],
};

const monitoring = (state = initialState, action) => {
  switch (action.type) {
    case types.START_MONITORING_FUNCTION:
      return {
        ...state,
        mfas: action.mfas,
      };
    default:
      return state;
  }
};

export default monitoring;
