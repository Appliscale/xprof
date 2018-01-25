import { initial, last } from 'lodash';
import * as types from '../constants/ActionTypes';

const initialState = {
  calls: {},
  controls: {},
};

const tracing = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_CALLS:
      return {
        ...state,
        calls: action.calls,
      };
    case types.TOGGLE_EXPAND_ITEM:
      return {
        ...state,
        calls: {
          ...state.calls,
          [action.functionName]: [
            ...initial(state.calls[action.functionName]),
            {
              ...last(state.calls[action.functionName]),
              items: action.updatedItems,
            },
          ],
        },
      };
    case types.UPDATE_CALLS_CONTROLS:
      return {
        ...state,
        controls: {
          ...action.mfas.reduce(
            (control, mfa) => ({
              ...control,
              [mfa[3]]: {
                threshold: undefined,
                limit: undefined,
                collecting: false,
              },
            }),
            {},
          ),
        },
      };
    case types.SET_CALLS_CONTROL:
      return {
        ...state,
        controls: {
          ...state.controls,
          [action.functionName]: action.control,
        },
      };
    default:
      return state;
  }
};

export default tracing;
