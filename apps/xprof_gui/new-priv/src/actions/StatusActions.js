import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { getStatus } from '../selectors';
import { STATUS, SPEC } from '../constants';

const setTraceStatus = status => ({
  type: types.SET_TRACE_STATUS,
  status,
});

const setTraceStatusRequest = status => ({
  type: types.TOGGLE_TRACE_STATUS,
  status,
});

const setTraceStatusError = status => ({
  type: types.TOGGLE_TRACE_STATUS_ERROR,
  status,
});

const setTraceStatusSuccess = status => ({
  type: types.TOGGLE_TRACE_STATUS_SUCCESS,
  status,
});

export const getTraceStatus = () => async (dispatch, getState) => {
  const state = getState();
  const status = getStatus(state);

  const { json, error } = await XProf.getTracingStatus();
  if (error) console.log('ERROR: ', error);
  else if (json.status !== status) dispatch(setTraceStatus(json.status));
};

export const toggleTraceStatus = () => async (dispatch, getState) => {
  const state = getState();
  const status = getStatus(state);

  const toggledStatus =
    status === STATUS.RUNNING ? STATUS.PAUSED : STATUS.RUNNING;
  const spec = status === STATUS.RUNNING ? SPEC.PAUSE : SPEC.ALL;
  dispatch(setTraceStatusRequest(toggledStatus));

  const { error } = await XProf.setTracingStatus(spec);
  if (error) dispatch(setTraceStatusError(status));
  else dispatch(setTraceStatusSuccess(toggledStatus));
};
