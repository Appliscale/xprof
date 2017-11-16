import { isEqual, sortBy, last, takeRight } from 'lodash';
import { getMfas, getData } from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import { callApi } from '../utils/ApiUtils';
import {
  ALL_MONITORED_FUNCTIONS_URL,
  MONITORED_FUNCTION_DATA_URL,
  CAPTURE_FUNCTION_DATA_URL,
  DPS_LIMIT,
} from '../constants';

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

  const { json, error } = await callApi(ALL_MONITORED_FUNCTIONS_URL);
  if (error) console.log(error);
  else if (!isEqual(mfas, json)) dispatch(updateListMonitoringFunctions(json));
};

export const poolData = () => async (dispatch, getState) => {
  const state = getState();
  const mfas = getMfas(state);
  const data = getData(state);
  const nextData = {};
  let error;

  console.log('************JEDZIEM***********');
  mfas.forEach(async (mfa) => {
    const completeName = mfa[3];
    const currentDps = data[completeName];
    const lastTs = currentDps ? last(currentDps).time : 0;

    const { json, err } = await callApi(`${MONITORED_FUNCTION_DATA_URL}?` +
        `mod=${mfa[0]}&` +
        `fun=${mfa[1]}&` +
        `arity=${mfa[2]}&` +
        `last_ts=${lastTs}`);

    if (err) console.log(err, data, error);
    else {
      const incomingDps = sortBy(json, 'time');
      const concatenatedDps = currentDps ? [...currentDps, ...incomingDps] : incomingDps;
      const nextDps = takeRight(concatenatedDps, DPS_LIMIT);
      nextData[completeName] = nextDps;
      console.log('UPDATING ... ', completeName);
    }
  });
  console.log('************KONIEC***********');
  dispatch(updateData(nextData));
};

export const poolCapture = () => async (dispatch) => {
  // const state = getState();
  // const capture = getCapture(state);

  const { json, error } = await callApi(`${CAPTURE_FUNCTION_DATA_URL}?
    mod=mod&fun=fun&arity=arity&offset=offset`);
  if (error) console.log(error);
  else {
    console.log(json);
    dispatch(updateCapture(json));
  }
};
