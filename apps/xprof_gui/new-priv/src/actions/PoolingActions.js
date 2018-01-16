import { isEqual, isEmpty, sortBy, last, takeRight } from 'lodash';
import {
  getMfas,
  getData,
  getCapture,
  getLastCaptureForFunction,
} from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import { api } from '../utils/ApiUtils';
import {
  ALL_MONITORED_FUNCTIONS_URL,
  MONITORED_FUNCTION_DATA_URL,
  CAPTURE_FUNCTION_DATA_URL,
  DPS_LIMIT,
} from '../constants';
import { updateCallsControls, updateCallsControl } from './TracingActions';
import { determineNextCapture, determineNextControl } from '../utils';

export const updateListMonitoringFunctions = mfas => ({
  type: types.UPDATE_MONITORED_FUNCTIONS,
  mfas,
});

export const updateData = data => ({
  type: types.UPDATE_DATA,
  data,
});

export const updateCapture = capture => ({
  type: types.UPDATE_CAPTURE,
  capture,
});

export const poolMonitoredFunctions = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);

  const { json, error } = await api.get(ALL_MONITORED_FUNCTIONS_URL);
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

export const poolData = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const data = getData(state);
  const nextData = {};

  await Promise.all(mfas.map(async (mfa) => {
    const completeFunName = mfa[3];
    const currentDps = data[completeFunName];
    const lastTs =
        currentDps && currentDps.length ? last(currentDps).time / 1000 : 0;

    const { json, error } = await api.get(MONITORED_FUNCTION_DATA_URL, {
      mod: mfa[0],
      fun: mfa[1],
      arity: mfa[2],
      last_ts: lastTs,
    });

    if (error) {
      console.log('ERROR: ', error);
    } else {
      const incomingDpsSorted = sortBy(json, 'time');
      const incomingDps = incomingDpsSorted.map(sample => ({
        ...sample,
        time: sample.time * 1000,
      }));

      const concatenatedDps = currentDps
        ? [...currentDps, ...incomingDps]
        : incomingDps;
      const nextDps = takeRight(concatenatedDps, DPS_LIMIT);
      nextData[completeFunName] = nextDps;
    }
  }));

  if (!isEmpty(nextData)) {
    dispatch(updateData({ ...data, ...nextData }));
  }
};

export const poolCapture = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const capture = getCapture(state);
  const nextCapture = {};

  await Promise.all(mfas.map(async (mfa) => {
    const completeFunName = mfa[3];
    const lastCapture = getLastCaptureForFunction(state, completeFunName);

    const offset =
        lastCapture && lastCapture.items.length
          ? last(lastCapture.items).id
          : 0;

    const { json, error } = await api.get(CAPTURE_FUNCTION_DATA_URL, {
      mod: mfa[0],
      fun: mfa[1],
      arity: mfa[2],
      offset,
    });

    if (error) {
      console.log('ERROR: ', error);
    } else {
      const nextControlForFun = determineNextControl(json, lastCapture);
      if (!isEmpty(nextControlForFun)) {
        dispatch(updateCallsControl(completeFunName, nextControlForFun));
      }

      const nextCaptureForFun = determineNextCapture(
        json,
        lastCapture,
        capture,
        completeFunName,
      );
      if (!isEmpty(nextCaptureForFun)) {
        nextCapture[completeFunName] = nextCaptureForFun;
      }
    }
  }));

  if (!isEmpty(nextCapture)) {
    dispatch(updateCapture({ ...capture, ...nextCapture }));
  }
};
