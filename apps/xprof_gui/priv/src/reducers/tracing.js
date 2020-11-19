import { last } from 'lodash';
import * as types from '../constants/ActionTypes';

const initialState = {
  calls: {},
  controls: {},
  panel: {},
  paginations: {},
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
          [action.functionName]: state.calls[action.functionName].map((c, i) =>
            (i === action.index
              ? {
                ...last(state.calls[action.functionName]),
                sort: {
                  ...last(state.calls[action.functionName]).sort,
                  items: action.updatedItems,
                },
              }
              : c)),
        },
      };
    case types.SORT_CALLS:
      return {
        ...state,
        calls: {
          ...state.calls,
          // eslint-disable-next-line
          [action.functionName]: state.calls[action.functionName].map(
            (c, i) => (i === action.index ? action.sortedCalls : c)),
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
    case types.SET_PAGINATIONS:
      return {
        ...state,
        paginations: {
          ...state.paginations,
          ...action.paginations,
        },
      };
    case types.SET_CALLS_PAGE: {
      return {
        ...state,
        paginations: {
          ...state.paginations,
          [action.functionName]: {
            ...state.paginations[action.functionName],
            current: action.page,
          },
        },
      };
    }
    case types.SET_START_CALLS_PAGE: {
      return {
        ...state,
        paginations: {
          ...state.paginations,
          [action.functionName]: {
            ...state.paginations[action.functionName],
            start: action.start,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default tracing;
