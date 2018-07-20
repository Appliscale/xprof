import { take } from 'lodash';
import { getNotificationsLastId, getNotifications } from '../selectors';
import { NOTIFICATIONS } from '../constants';
import * as types from '../constants/ActionTypes';

const appendNotification = notification => ({
  type: types.ADD_NOTIFICATION,
  notification,
});

export const lostConnection = () => ({
  type: types.LOST_CONNECTION,
});

export const aliveConnection = () => ({
  type: types.ALIVE_CONNECTION,
});

export const hideConnectionNotification = () => ({
  type: types.HIDE_CONNECTION_NOTIFICATION,
});

export const removeNotification = id => ({
  type: types.REMOVE_NOTIFICATION,
  id,
});

export const addNotification = (
  severity,
  message,
  error,
  timeout = NOTIFICATIONS.TIMEOUT,
) => async (dispatch, getState) => {
  const state = getState();

  const notifications = getNotifications(state);
  if (notifications.length > 9) {
    const toRemove = notifications.length - 9;
    const notificatinosToRemove = take(notifications, toRemove);
    notificatinosToRemove.forEach(n => dispatch(removeNotification(n.id)));
  }

  debugger;
  const lastId = getNotificationsLastId(state);
  const notification = {
    id: lastId + 1,
    severity: (error && error.data && error.data.severity)
      ? error.data.severity : severity,
    message: (error && error.data && error.data.message)
      ? error.data.message : message,
  };

  dispatch(appendNotification(notification));
  setTimeout(() => dispatch(removeNotification(notification.id)), timeout);
};
