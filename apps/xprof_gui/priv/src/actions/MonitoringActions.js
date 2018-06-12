import { getAllMonitored } from '../selectors';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';

const stopMonitoringFunctionRequest = monitoredCollection => ({
  type: types.STOP_MONITORING_FUNCTION,
  monitoredCollection,
});

const stopMonitoringFunctionError = monitoredCollection => ({
  type: types.STOP_MONITORING_FUNCTION_ERROR,
  monitoredCollection,
});

export const stopMonitoringFunction = monitored => async (
  dispatch, getState,
) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const monitoredCollectionReduced = monitoredCollection
    .filter(f => f.query !== monitored.query);

  dispatch(stopMonitoringFunctionRequest(monitoredCollectionReduced));

  const { error } = await XProf.stopMonitoringFunction(
    monitored.mfa[0],
    monitored.mfa[1],
    monitored.mfa[2],
  );
  if (error) {
    console.log('ERROR: ', error);
    dispatch(stopMonitoringFunctionError(monitoredCollection));
  }
};

export const startMonitoringFunction = functionName => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const isMonitored = monitoredCollection
    .filter(monitored => monitored.query === functionName).length;

  if (!isMonitored) {
    const { error } = await XProf.startMonitoringFunction(functionName);
    if (error) console.log('ERROR: ', error);
  }
};
