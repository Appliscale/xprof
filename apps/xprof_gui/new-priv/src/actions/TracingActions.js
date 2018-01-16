import {
  getLastCaptureForFunction,
  getControlForFunction,
} from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import { api } from '../utils/ApiUtils';
import { STOP_CAPTURE_URL, START_CAPTURE_URL } from '../constants/index';

export const toggleExpand = (functionName, updatedItems) => ({
  type: types.TOGGLE_EXPAND_ITEM,
  functionName,
  updatedItems,
});

export const updateCallsControls = mfas => ({
  type: types.UPDATE_CALLS_CONTROLS,
  mfas,
});

export const updateCallsControl = (functionName, control) => ({
  type: types.SET_CALLS_CONTROL,
  functionName,
  control,
});

export const toggleExpandItem = (mfa, item) => (dispatch, getState) => {
  const state = getState();
  const functionName = mfa[3];
  const lastCaptureFunction = getLastCaptureForFunction(state, functionName);

  const updatedItems = lastCaptureFunction.items.map((call) => {
    if (call.id === item.id) {
      return {
        ...call,
        expanded: !call.expanded,
      };
    }
    return call;
  });

  dispatch(toggleExpand(functionName, updatedItems));
};

export const toggleCallsTracing = mfa => async (dispatch, getState) => {
  const state = getState();
  const functionName = mfa[3];
  const { threshold, limit, collecting } = getControlForFunction(
    state,
    functionName,
  );
  let nextControl;

  if (collecting) {
    const { error } = await api.get(STOP_CAPTURE_URL, {
      mod: mfa[0],
      fun: mfa[1],
      arity: mfa[2],
    });
    if (error) console.log('ERROR: ', error);

    nextControl = {
      threshold,
      limit,
      collecting: false,
    };
  } else {
    const { error } = await api.get(START_CAPTURE_URL, {
      mod: mfa[0],
      fun: mfa[1],
      arity: mfa[2],
      threshold,
      limit,
    });
    if (error) console.log('ERROR: ', error);

    nextControl = {
      threshold,
      limit,
      collecting: true,
    };
  }
  dispatch(updateCallsControl(functionName, nextControl));
};

export const handleThresholdChange = (mfa, value) => (dispatch, getState) => {
  const state = getState();
  const functionName = mfa[3];
  const { limit, collecting } = getControlForFunction(state, functionName);
  const nextControl = {
    threshold: value,
    limit,
    collecting,
  };
  dispatch(updateCallsControl(functionName, nextControl));
};

export const handleLimitChange = (mfa, value) => (dispatch, getState) => {
  const state = getState();
  const functionName = mfa[3];
  const { threshold, collecting } = getControlForFunction(state, functionName);
  const nextControl = {
    threshold,
    limit: value,
    collecting,
  };
  dispatch(updateCallsControl(functionName, nextControl));
};
