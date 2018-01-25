import { remove } from 'lodash';
import { getMfas } from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api/XProf';

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

  const { error } = await XProf.stopMonitoringFunction(mfa[0], mfa[1], mfa[2]);
  if (error) dispatch(stopMonitoringFunctionError(mfas));
};
