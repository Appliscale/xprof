import {
  getLastCallsForFunction,
  getFunctionsControl,
} from '../selectors/CommonSelectors';
import * as types from '../constants/ActionTypes';
import { determineNextControlSwitch } from '../utils';

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
  const lastCallsForFunction = getLastCallsForFunction(state, functionName);

  const updatedItems = lastCallsForFunction.items.map((call) => {
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
  const control = getFunctionsControl(state, functionName);
  const nextControl = await determineNextControlSwitch(control, mfa);
  dispatch(updateCallsControl(functionName, nextControl));
};

export const handleThresholdChange = (mfa, value) => (dispatch, getState) => {
  const state = getState();
  const functionName = mfa[3];
  const { limit, collecting } = getFunctionsControl(state, functionName);
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
  const { threshold, collecting } = getFunctionsControl(state, functionName);
  const nextControl = {
    threshold,
    limit: value,
    collecting,
  };
  dispatch(updateCallsControl(functionName, nextControl));
};
