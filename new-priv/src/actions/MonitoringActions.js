import { remove } from 'lodash';
import * as types from '../constants/ActionTypes';
import { getMfas } from '../selectors/CommonSelectors';
import { STOP_MONITORING_FUNCTION_URL } from '../constants/';
import { callApi } from '../utils/ApiUtils';

export const stopMonitoringFunctionRequest = mfas => ({
  type: types.STOP_MONITORING_FUNCTION,
  mfas,
});

export const stopMonitoringFunctionError = mfas => ({
  type: types.STOP_MONITORING_FUNCTION_ERROR,
  mfas,
});

export const stopMonitoringFunction = mfa => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const mfasReduced = remove(mfas, mfa);

  dispatch(stopMonitoringFunctionRequest(mfasReduced));

  const { error } = await callApi(`${STOP_MONITORING_FUNCTION_URL}?` +
      `mod=${mfa[0]}&` +
      `fun=${mfa[1]}&` +
      `arity=${mfa[2]}`);
  if (error) dispatch(stopMonitoringFunctionError(mfas));
};
