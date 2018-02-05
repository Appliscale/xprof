import * as types from '../constants/ActionTypes';

const initialState = {
  graphVisibility: {},
  tracingVisibility: {},
};

const layout = (state = initialState, action) => {
  switch (action.type) {
    case types.EXPAND_GRAPH_PANEL:
      return {
        ...state,
        graphVisibility: {
          ...state.graphVisibility,
          [action.functionName]: true,
        },
      };
    case types.SHRINK_GRAPH_PANEL:
      return {
        ...state,
        graphVisibility: {
          ...state.graphVisibility,
          [action.functionName]: false,
        },
      };
    case types.EXPAND_TRACING_PANEL:
      return {
        ...state,
        tracingVisibility: {
          ...state.tracingVisibility,
          [action.functionName]: true,
        },
      };
    case types.SHRINK_TRACING_PANEL:
      return {
        ...state,
        tracingVisibility: {
          ...state.tracingVisibility,
          [action.functionName]: false,
        },
      };
    default:
      return state;
  }
};

export default layout;
