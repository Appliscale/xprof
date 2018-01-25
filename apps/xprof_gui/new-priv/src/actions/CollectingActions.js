import { isEqual, isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api/XProf';
import { getMfas, getData, getCalls } from '../selectors/CommonSelectors';
import { updateCallsControls } from './TracingActions';
import { determineNextData, determineNextCalls } from '../utils';

export const updateListMonitoringFunctions = mfas => ({
  type: types.UPDATE_MONITORED_FUNCTIONS,
  mfas,
});

export const updateData = data => ({
  type: types.UPDATE_DATA,
  data,
});

export const updateCalls = calls => ({
  type: types.UPDATE_CALLS,
  calls,
});

export const getMonitoredFunctions = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);

  const { json, error } = await XProf.getAllMonitoredFunctions();
  if (error) {
    console.log('ERROR: ', error);
  } else if (!isEqual(mfas, json)) {
    if (json.length < mfas.length) {
      dispatch(updateListMonitoringFunctions(json));
      dispatch(updateCallsControls(json));
    } else {
      dispatch(updateCallsControls(json));
      dispatch(updateListMonitoringFunctions(json));
    }
  }
};

export const getFunctionsData = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const data = getData(state);
  const nextData = await determineNextData(mfas, data);

  if (!isEmpty(nextData)) {
    dispatch(updateData({ ...data, ...nextData }));
  }
};

export const getFunctionsCalls = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const calls = getCalls(state);
  const nextCalls = await determineNextCalls(dispatch, state, mfas, calls);

  if (!isEmpty(nextCalls)) {
    dispatch(updateCalls({ ...calls, ...nextCalls }));
  }
};
