import { getMfas } from '../selectors';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { addNotification } from './';
import { NOTIFICATIONS } from '../constants';

const stopMonitoringFunctionRequest = mfas => ({
  type: types.STOP_MONITORING_FUNCTION,
  mfas,
});

const stopMonitoringFunctionError = mfas => ({
  type: types.STOP_MONITORING_FUNCTION_ERROR,
  mfas,
});

export const stopMonitoringFunction = mfa => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const mfasReduced = mfas.filter(m => m[3] !== mfa[3]);

  dispatch(stopMonitoringFunctionRequest(mfasReduced));

  const { error } = await XProf.stopMonitoringFunction(mfa[0], mfa[1], mfa[2]);
  if (error) {
    dispatch(addNotification(
      NOTIFICATIONS.MONITORING.SEVERITY,
      NOTIFICATIONS.MONITORING.MESSAGE(mfa[3]),
    ));
    dispatch(stopMonitoringFunctionError(mfas));
  }
};

export const startMonitoringFunction = (
  functionName,
  onSuccess,
  onError,
) => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const isMonitored = mfas.filter(mfa => mfa[3] === functionName).length;

  let error;
  if (!isMonitored) {
    ({ error } = await XProf.startMonitoringFunction(functionName));
  }
  if (error && onError) {
    onError();
  } else if (onSuccess) {
    onSuccess();
  }
};
