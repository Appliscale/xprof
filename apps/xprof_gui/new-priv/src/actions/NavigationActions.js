import * as types from '../constants/ActionTypes';
import {
  getACfunctions,
  getACposition,
  getQuery,
  getHighlightedFunction,
} from '../selectors/CommonSelectors';
import {
  HANDLED_KEYS,
  FUNCTION_AUTOEXPANSION_URL,
  START_MONITORING_FUNCTION_URL,
} from '../constants';
// import { STATUS, HANDLED_KEYS } from '../constants';
import { commonArrayPrefix, isMfa } from '../utils/CommonUtils';
import { callApi } from '../utils/ApiUtils';

export const setACfunctions = functions => ({
  type: types.FILL_AUTOCOMPLETER_FUNCTIONS,
  functions,
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
    const endpoint = `${FUNCTION_AUTOEXPANSION_URL}?query=${query}`;
    const { json } = await callApi(endpoint);
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
    const endpoint = `${START_MONITORING_FUNCTION_URL}?query=${selected}`;
    const { error } = await callApi(endpoint);
    if (error) console.log('ERROR: ', error);
  } else {
    dispatch(queryInputChange(selected));
  }
};

export const queryKeyDown = key => async (dispatch, getState) => {
  const state = getState();
  const position = getACposition(state);
  const functions = getACfunctions(state);
  const query = getQuery(state);
  const highlightedFunction = getHighlightedFunction(state);
  let chosenQuery;

  switch (key) {
    case HANDLED_KEYS.ARROW_DOWN:
      if (position < functions.length - 1) dispatch(setPosition(position + 1));
      break;
    case HANDLED_KEYS.ARROW_UP:
      if (position > 0) dispatch(setPosition(position - 1));
      break;
    case HANDLED_KEYS.TAB:
      // Don't modify search box content if it is not a prefix of the
      // new value, don't want to overwrite a match-spec fun
      // (for which there are still suggestions) that is being edited
      // with some arity.
      if (highlightedFunction && highlightedFunction.startsWith(query)) {
        dispatch(queryInputChange(highlightedFunction));
      } else if (
        functions.length &&
        commonArrayPrefix(functions).startsWith(query)
      ) {
        dispatch(queryInputChange(commonArrayPrefix(functions)));
      }
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
        const params = `query=${chosenQuery}`;
        const endpoint = `${START_MONITORING_FUNCTION_URL}?${params}`;
        const { error } = await callApi(endpoint);
        if (error) console.log('ERROR: ', error);
      }
      break;
    default:
      break;
  }
};

export const A = 1;
