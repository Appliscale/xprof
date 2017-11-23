import { isEqual, isEmpty, sortBy, last, takeRight, initial } from 'lodash';
import { captureDecision } from '../utils/CommonUtils';
import { CAPTURE_ACTION } from '../constants/TracingConstants';
import {
  getMfas,
  getData,
  getCapture,
  getLastCaptureForFunction,
} from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import { callApi } from '../utils/ApiUtils';
import {
  ALL_MONITORED_FUNCTIONS_URL,
  MONITORED_FUNCTION_DATA_URL,
  CAPTURE_FUNCTION_DATA_URL,
  DPS_LIMIT,
} from '../constants';
import { updateCallsControls, updateCallsControl } from './TracingActions';

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

    const { json, error } = await callApi(`${MONITORED_FUNCTION_DATA_URL}?` +
          `mod=${mfa[0]}&` +
          `fun=${mfa[1]}&` +
          `arity=${mfa[2]}&` +
          `last_ts=${lastTs}`);

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
    let nextControl;

    const offset =
        lastCapture && lastCapture.items.length
          ? last(lastCapture.items).id
          : 0;

    const { json, error } = await callApi(`${CAPTURE_FUNCTION_DATA_URL}?` +
          `mod=${mfa[0]}&` +
          `fun=${mfa[1]}&` +
          `arity=${mfa[2]}&` +
          `offset=${offset}`);

    if (error) {
      console.log('ERROR: ', error);
    } else {
      switch (captureDecision(json, lastCapture)) {
        case CAPTURE_ACTION.APP_INITIALIZATION:
          nextControl = {
            threshold: undefined,
            limit: undefined,
            collecting: false,
          };
          dispatch(updateCallsControl(completeFunName, nextControl));
          nextCapture[completeFunName] = [
            {
              captureId: json.capture_id,
              items: json.items.map(item => ({ ...item, expanded: false })),
              has_more: json.has_more,
            },
          ];
          break;
        case CAPTURE_ACTION.START_FIRST_CAPTURE:
          nextControl = {
            threshold: json.threshold,
            limit: json.limit,
            collecting: true,
          };
          dispatch(updateCallsControl(completeFunName, nextControl));
          nextCapture[completeFunName] = [
            {
              captureId: json.capture_id,
              items: json.items.map(item => ({ ...item, expanded: false })),
              has_more: json.has_more,
            },
          ];
          break;
        case CAPTURE_ACTION.START_NEXT_CAPTURE:
          nextControl = {
            threshold: json.threshold,
            limit: json.limit,
            collecting: true,
          };
          dispatch(updateCallsControl(completeFunName, nextControl));
          nextCapture[completeFunName] = [
            ...capture[completeFunName],
            {
              captureId: json.capture_id,
              items: json.items.map(item => ({ ...item, expanded: false })),
              has_more: json.has_more,
            },
          ];
          break;
        case CAPTURE_ACTION.CAPTURING:
          if (!json.has_more) {
            nextControl = {
              threshold: undefined,
              limit: undefined,
              collecting: false,
            };
            dispatch(updateCallsControl(completeFunName, nextControl));
          }
          nextCapture[completeFunName] = [
            ...initial(capture[completeFunName]),
            {
              captureId: lastCapture.captureId,
              items: [
                ...lastCapture.items,
                ...json.items.map(item => ({ ...item, expanded: false })),
              ],
              has_more: json.has_more,
            },
          ];
          break;
        default:
          break;
      }
    }
  }));

  if (!isEmpty(nextCapture)) {
    dispatch(updateCapture({ ...capture, ...nextCapture }));
  }
};
