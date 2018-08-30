import { getAllMonitored } from '../selectors';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { addNotification, addRecentQuery, clearFunctionBrowser } from './';
import { NOTIFICATIONS } from '../constants';

const stopMonitoringFunctionRequest = monitoredCollection => ({
  type: types.STOP_MONITORING_FUNCTION,
  monitoredCollection,
});

const stopMonitoringFunctionError = monitoredCollection => ({
  type: types.STOP_MONITORING_FUNCTION_ERROR,
  monitoredCollection,
});

export const stopMonitoringFunction = monitored => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const reduced = monitoredCollection.filter(f => f.query !== monitored.query);

  dispatch(stopMonitoringFunctionRequest(reduced));

  const { error } = await XProf.stopMonitoringFunction(
    monitored.mfa[0],
    monitored.mfa[1],
    monitored.mfa[2],
  );
  if (error) {
    dispatch(addNotification(
      NOTIFICATIONS.MONITORING.SEVERITY,
      NOTIFICATIONS.MONITORING.MESSAGE(monitored.query),
    ));
    dispatch(stopMonitoringFunctionError(monitoredCollection));
  }
};

export const startMonitoringFunction = query => async (dispatch) => {
  const { error } = await XProf.startMonitoringFunction(query);
  if (error) {
    dispatch(addNotification(
      NOTIFICATIONS.START_MONITORING.SEVERITY,
      NOTIFICATIONS.START_MONITORING.MESSAGE(query),
      error,
    ));
  } else {
    dispatch(addRecentQuery(query));
    dispatch(clearFunctionBrowser());
  }
};
