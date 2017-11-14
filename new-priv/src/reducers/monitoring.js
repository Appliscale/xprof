import * as types from '../constants/ActionTypes';

const initialState = {
  mfas: [],
  data: [],
};

const monitoring = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_MONITORED_FUNCTIONS:
      return {
        ...state,
        mfas: action.mfas,
      };
    case types.UPDATE_DATA:
      return {
        ...state,
        data: action.data,
      };
    default:
      return state;
  }
};

export default monitoring;
