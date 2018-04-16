import { initial, last } from 'lodash';
import * as types from '../constants/ActionTypes';

const initialState = {
  calls: {},
  controls: {},
  panel: {},
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
              sort: {
                ...last(state.calls[action.functionName]).sort,
                items: action.updatedItems,
              },
            },
          ],
        },
      };
    case types.SORT_CALLS:
      return {
        ...state,
        calls: {
          ...state.calls,
          [action.functionName]: [
            ...initial(state.calls[action.functionName]),
            action.sortedCalls,
          ],
        },
      };
    case types.SET_CALLS_CONTROL:
      return {
        ...state,
        controls: {
          ...state.controls,
          ...action.control,
        },
      };
    default:
      return state;
  }
};

export default tracing;
