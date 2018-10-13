import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import {
  getACfunctions,
  getPromptPosition,
  getQuery,
  getHighlightedFunction,
  getRecentQueries,
  getDirtyInput,
} from '../selectors';
import { HANDLED_KEYS, NOTIFICATIONS } from '../constants';
import { commonArrayPrefix } from '../utils';
import { startMonitoringFunction, addNotification } from './';

const setACfunctions = functions => ({
  type: types.FILL_AUTOCOMPLETER_FUNCTIONS,
  functions,
});

const setPosition = position => ({
  type: types.SET_POSITION,
  position,
});

export const clearFunctionBrowser = () => ({
  type: types.CLEAR_FUNCTION_BROWSER,
});

const setQueryInput = query => ({
  type: types.QUERY_INPUT_CHANGE,
  query,
});

const setLanguage = language => ({
  type: types.SET_LANGUAGE,
  language,
});

const setType = inputType => ({
  type: types.SET_TYPE,
  inputType,
});

const setExample = example => ({
  type: types.SET_EXAMPLE,
  example,
});

export const addRecentQuery = query => ({
  type: types.ADD_RECENT_QUERY,
  query,
});

const saveDirtyInput = query => ({
  type: types.SAVE_DIRTY_INPUT,
  query,
});

export const queryInputChange = query => async (dispatch) => {
  dispatch(setQueryInput(query));
  if (query) {
    const { json } = await XProf.getFunctionAutoexpansion(query);
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
  if (selected.startsWith(query)) {
    dispatch(startMonitoringFunction(selected));
  } else {
    dispatch(queryInputChange(selected));
  }
};

export const queryKeyDown = key => async (dispatch, getState) => {
  const state = getState();
  const position = getPromptPosition(state);
  const functions = getACfunctions(state);
  const query = getQuery(state);
  const dirtyInput = getDirtyInput(state);
  const recent = getRecentQueries(state);
  const highlightedFunction = getHighlightedFunction(state);
  let chosenQuery;

  switch (key) {
    case HANDLED_KEYS.ARROW_DOWN:
      if (position < functions.length - 1) {
        dispatch(setPosition(position + 1));
        if (position < -2) {
          dispatch(setQueryInput(recent[recent.length + position + 2]));
        } else if (position === -2) {
          dispatch(queryInputChange(dirtyInput));
        }
      }
      break;
    case HANDLED_KEYS.ARROW_UP:
      if (position >= -recent.length) {
        dispatch(setPosition(position - 1));
        if (position <= -1) {
          dispatch(setQueryInput(recent[recent.length + position]));
          if (position === -1) {
            dispatch(saveDirtyInput(query));
            dispatch(setACfunctions([]));
          }
        }
      }
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

      dispatch(startMonitoringFunction(chosenQuery));
      break;
    default:
      break;
  }
};

export const setPositionOnFunction = name => (dispatch, getState) => {
  const state = getState();
  const functions = getACfunctions(state);
  const position = functions.indexOf(name);
  dispatch(setPosition(position));
};

export const getMode = () => async (dispatch) => {
  const { json, error } = await XProf.getMode();

  if (error) {
    const { serverity, message } = NOTIFICATIONS.MODE;
    dispatch(addNotification(serverity, message));
  } else if (json.mode === 'elixir') {
    dispatch(setLanguage('Elixir'));
    dispatch(setType('query'));
    dispatch(setExample('Enum.member?(_, :test)'));
  } else if (json.mode === 'erlang') {
    dispatch(setLanguage('Erlang'));
    dispatch(setType('trace pattern'));
    dispatch(setExample('ets:lookup(data, _)'));
  }
};
