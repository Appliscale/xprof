import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import {
  getACfunctions,
  getPromptPosition,
  getQuery,
  getCommonExpansion,
  getHighlightedFunction,
  getRecentQueries,
  getDirtyInput,
} from '../selectors';
import { HANDLED_KEYS, NOTIFICATIONS } from '../constants';
import { startMonitoringFunction, addNotification } from './';

const setACfunctions = (expansion, functions) => ({
  type: types.FILL_AUTOCOMPLETER_MATCHES,
  expansion,
  functions,
});

const setPosition = position => ({
  type: types.SET_POSITION,
  position,
});

const clearFunctionBrowser = () => ({
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

const addRecentQuery = query => ({
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
    dispatch(setACfunctions(json.expansion, json.matches));
    if (json.matches.length === 1) dispatch(setPosition(0));
    else dispatch(setPosition(-1));
  } else {
    dispatch(setACfunctions('', []));
  }
};

export const functionClick = selected => async (dispatch, getState) => {
  const state = getState();
  const query = getQuery(state);
  if (selected.startsWith(query)) {
    const onSuccess = () => {
      dispatch(addRecentQuery(selected));
      dispatch(clearFunctionBrowser());
    };
    dispatch(startMonitoringFunction(selected, onSuccess));
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
  const commonExpansion = getCommonExpansion(state);
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
      if (highlightedFunction) {
        dispatch(queryInputChange(query + highlightedFunction.expansion));
      } else {
        dispatch(queryInputChange(query + commonExpansion));
      }
      break;
    case HANDLED_KEYS.ESC:
      dispatch(clearFunctionBrowser());
      dispatch(setPosition(-1));
      break;
    case HANDLED_KEYS.RETURN:
      if (highlightedFunction) {
        chosenQuery = query + highlightedFunction.expansion;
        // dispatch(queryInputChange(chosenQuery));
      } else if (query) {
        chosenQuery = query;
      }

      dispatch(startMonitoringFunction(
        chosenQuery,
        () => {
          dispatch(addRecentQuery(chosenQuery));
          dispatch(clearFunctionBrowser());
        },
        error =>
          dispatch(addNotification(
            NOTIFICATIONS.FUNCTION_DOESNOT_EXIST.SEVERITY,
            NOTIFICATIONS.FUNCTION_DOESNOT_EXIST.MESSAGE(chosenQuery),
            error,
          )),
      ));
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
