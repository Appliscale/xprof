import { getAllMonitored } from '../selectors';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { addNotification } from './';
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

export const startMonitoringFunction = (
  functionName,
  onSuccess,
  onError,
) => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const isMonitored = monitoredCollection.filter(f => f.query === functionName)
    .length;

  let error;
  if (!isMonitored) {
    ({ error } = await XProf.startMonitoringFunction(functionName));
  }
  if (error && onError) {
    onError(error);
  } else if (onSuccess) {
    onSuccess();
  }
};
