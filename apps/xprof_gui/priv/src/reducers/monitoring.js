import * as types from '../constants/ActionTypes';

const initialState = {
  monitoredCollection: [],
  data: {},
  y: {},
  panel: {},
  callees: {},
  ids: {},
  size: {
    width: 0,
    height: 0,
    marginTop: 20,
    marginRight: 0,
    marginBottom: 70,
    marginLeft: 0,
  },
};

const monitoring = (state = initialState, action) => {
  switch (action.type) {
    case types.STOP_MONITORING_FUNCTION:
    case types.STOP_MONITORING_FUNCTION_ERROR:
    case types.UPDATE_MONITORED_FUNCTIONS:
      return {
        ...state,
        monitoredCollection: action.monitoredCollection,
      };
    case types.UPDATE_DATA:
      return {
        ...state,
        data: action.data,
      };
    case types.CHANGE_SIZE:
      return {
        ...state,
        size: {
          ...state.size,
          [action.property]: action.value,
        },
      };
    case types.ASSIGN_GRAPH_ID:
      return {
        ...state,
        ids: action.ids,
      };
    case types.ADD_Y:
      return {
        ...state,
        y: {
          ...state.y,
          ...action.y,
        },
      };
    default:
      return state;
  }
};

export default monitoring;
