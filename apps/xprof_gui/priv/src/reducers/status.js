import * as types from '../constants/ActionTypes';
import { STATUS } from '../constants';

const initialState = {
  status: STATUS.INIT,
};

const status = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_TRACE_STATUS:
    case types.TOGGLE_TRACE_STATUS:
    case types.TOGGLE_TRACE_STATUS_ERROR:
    case types.TOGGLE_TRACE_STATUS_SUCCESS:
      return {
        ...state,
        status: action.status,
      };

    default:
      return state;
  }
};

export default status;
