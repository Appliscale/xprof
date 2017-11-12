import * as types from '../constants/ActionTypes';
import {
  getStatus,
  getACfunctions,
  getACposition,
  getQuery,
  getHighlightedFunction,
} from '../selectors/CommonSelectors';
import {
  STATUS,
  HANDLED_KEYS,
  FUNCTION_AUTOEXPANSION_URL,
  SET_TRACING_STATUS_URL,
  START_MONITORING_FUNCTION_URL,
} from '../constants';
// import { STATUS, HANDLED_KEYS } from '../constants';
import { commonArrayPrefix, isMfa } from '../utils/CommonUtils';
import { callApi } from '../utils/ApiUtils';

export const setACfunctions = functions => ({
  type: types.FILL_AUTOCOMPLETER_FUNCTIONS,
  functions,
});

export const setTraceStatusRequest = status => ({
  type: types.TOGGLE_TRACE_STATUS,
  status,
});

export const setTraceStatusError = status => ({
  type: types.TOGGLE_TRACE_STATUS_ERROR,
  status,
});

export const setTraceStatusSuccess = status => ({
  type: types.TOGGLE_TRACE_STATUS_SUCCESS,
  status,
});

export const setPosition = position => ({
  type: types.SET_POSITION,
  position,
});

export const clearFunctionBrowser = () => ({
  type: types.CLEAR_FUNCTION_BROWSER,
});

export const setQueryInput = query => ({
  type: types.QUERY_INPUT_CHANGE,
  query,
});

export const queryInputChange = query => async (dispatch) => {
  dispatch(setQueryInput(query));
  if (query) {
    const { json } = await callApi(`${FUNCTION_AUTOEXPANSION_URL}?query=${query}`);
    dispatch(setACfunctions(json));
    if (json.length === 1) dispatch(setPosition(0));
    else dispatch(setPosition(-1));
  } else {
    dispatch(setACfunctions([]));
  }
};

export const functionClick = selected => async (dispatch, getState) => {
  const state = getState();
  const query = getQuery(state);
  if (selected.startsWith(query) && isMfa(selected)) {
    dispatch(clearFunctionBrowser());
    const { error } = await callApi(`${START_MONITORING_FUNCTION_URL}?query=${selected}`);
    if (error) console.log('ERROR_STARTED_MONITORING: ', error);
    else console.log('STARTED_MONITORING');
  } else {
    dispatch(queryInputChange(selected));
  }
};

export const toggleTraceStatus = () => async (dispatch, getState) => {
  const state = getState();
  const status = getStatus(state);

  if (status === STATUS.RUNNING || status === STATUS.PAUSED) {
    const spec = status === STATUS.RUNNING ? STATUS.PAUSED : STATUS.RUNNING;
    dispatch(setTraceStatusRequest(spec));
    const { error } = await callApi(`${SET_TRACING_STATUS_URL}?spec=${spec}`);
    if (error) dispatch(setTraceStatusError(status));
    else dispatch(setTraceStatusSuccess(spec));
  }
};

export const queryKeyDown = key => async (dispatch, getState) => {
  const state = getState();
  const position = getACposition(state);
  const functions = getACfunctions(state);
  const query = getQuery(state);
  const highlightedFunction = getHighlightedFunction(state);

  // Don't modify search box content if it is not a prefix of the
  // new value, don't want to overwrite a match-spec fun
  // (for which there are still suggestions) that is being edited
  // with some arity.
  const checkMatchSpec = (next, current) =>
    (next.startsWith(current) ? dispatch(queryInputChange(next)) : null);

  let chosenQuery;

  switch (key) {
    case HANDLED_KEYS.ARROW_DOWN:
      if (position < functions.length - 1) dispatch(setPosition(position + 1));
      break;
    case HANDLED_KEYS.ARROW_UP:
      if (position > 0) dispatch(setPosition(position - 1));
      break;
    case HANDLED_KEYS.TAB:
      if (highlightedFunction) checkMatchSpec(highlightedFunction, query);
      else if (functions.length) checkMatchSpec(commonArrayPrefix(functions), query);
      break;
    case HANDLED_KEYS.ESC:
      dispatch(clearFunctionBrowser());
      break;
    case HANDLED_KEYS.RETURN:
      if (highlightedFunction && highlightedFunction.startsWith(query)) {
        chosenQuery = highlightedFunction;
      } else if (query) {
        chosenQuery = query;
      }

      if (chosenQuery) {
        dispatch(clearFunctionBrowser());
        const { error } = await callApi(`${START_MONITORING_FUNCTION_URL}?query=${chosenQuery}`);
        if (error) console.log('ERROR_STARTED_MONITORING: ', error);
        else console.log('STARTED_MONITORING');
      }
      break;
    default:
      break;
  }
};

export const A = 1;
