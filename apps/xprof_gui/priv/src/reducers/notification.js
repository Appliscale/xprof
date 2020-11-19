import * as types from '../constants/ActionTypes';

const initialState = {
  notifications: [],
  connection: true,
  showConnectionNotification: false,
};

const notifications = (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    case types.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };
    case types.LOST_CONNECTION:
      return {
        ...state,
        connection: false,
        showConnectionNotification: true,
      };
    case types.ALIVE_CONNECTION:
      return {
        ...state,
        connection: true,
        showConnectionNotification: true,
      };
    case types.HIDE_CONNECTION_NOTIFICATION:
      return {
        ...state,
        showConnectionNotification: false,
      };
    default:
      return state;
  }
};

export default notifications;
