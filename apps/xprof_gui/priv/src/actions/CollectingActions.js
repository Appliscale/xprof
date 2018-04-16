import { isEqual, isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { getMfas, getData, getCalls } from '../selectors';
import { setCallsControl, getCalleesForFunctions } from './';
import { determineNextData, determineNextCalls } from '../utils';

export const updateListMonitoringFunctions = mfas => ({
  type: types.UPDATE_MONITORED_FUNCTIONS,
  mfas,
});

const updateData = data => ({
  type: types.UPDATE_DATA,
  data,
});

const updateCalls = calls => ({
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
    const newMfas = json.filter(mfa => !mfas.map(f => f[3]).includes(mfa[3]));
    const newControls = newMfas.reduce(
      (control, mfa) => ({
        ...control,
        [mfa[3]]: {
          threshold: undefined,
          limit: undefined,
          collecting: false,
        },
      }),
      {},
    );

    dispatch(getCalleesForFunctions(newMfas));
    dispatch(setCallsControl(newControls));
    dispatch(updateListMonitoringFunctions(json));
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
