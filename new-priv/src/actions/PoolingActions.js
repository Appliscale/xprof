import * as types from '../constants/ActionTypes';
import { callApi } from '../utils/ApiUtils';
import {
  ALL_MONITORED_FUNCTIONS_URL,
  MONITORED_FUNCTION_DATA_URL,
  CAPTURE_FUNCTION_DATA_URL,
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

export const poolMonitoredFunctions = () => async (dispatch) => {
  // const state = getState();
  // const mfas = getMfas(state);

  const { json, error } = await callApi(ALL_MONITORED_FUNCTIONS_URL);
  if (error) console.log(error);
  else {
    console.log(json);
    dispatch(updateListMonitoringFunctions(json));
    // dispatch(updateListMonitoringFunctions(mfas));
  }
};

export const poolData = () => async (dispatch) => {
  // const state = getState();
  // const mfas = getMfas(state);
  // const data = getData(state);

  const { json, error } = await callApi(`${MONITORED_FUNCTION_DATA_URL}
    ?mod=mod&fun=fun&arity=arity&lastTs=lastTs`);
  if (error) console.log(error);
  else {
    console.log(json);
    dispatch(updateData(json));
    // dispatch(updateListMonitoringFunctions(mfas));
  }
};

export const poolCapture = () => async (dispatch) => {
  // const state = getState();
  // const capture = getCapture(state);

  const { json, error } = await callApi(`${CAPTURE_FUNCTION_DATA_URL}
    ?mod=mod&fun=fun&arity=arity&offset=offset`);
  if (error) console.log(error);
  else {
    console.log(json);
    dispatch(updateCapture(json));
  }
};
