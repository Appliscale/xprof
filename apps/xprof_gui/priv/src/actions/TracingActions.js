import {
  getCurrentCallsForFunction,
  getFunctionControl,
  getCountCallsPages,
  getStartCallsPage,
  getCurrentCallsPage,
} from '../selectors';
import * as types from '../constants/ActionTypes';
import { determineNextControlSwitch, sortItems } from '../utils';
import { SORT, VISIBLE_PAGES_NUMBER_LIMIT } from '../constants';

const toggleExpand = (functionName, updatedItems, index) => ({
  type: types.TOGGLE_EXPAND_ITEM,
  functionName,
  updatedItems,
  index,
});

export const setCallsControl = control => ({
  type: types.SET_CALLS_CONTROL,
  control,
});

export const setPaginations = paginations => ({
  type: types.SET_PAGINATIONS,
  paginations,
});

const updateCurrentCallsForFunction = (functionName, sortedCalls, index) => ({
  type: types.SORT_CALLS,
  functionName,
  sortedCalls,
  index,
});

export const setCallsPage = (functionName, page) => ({
  type: types.SET_CALLS_PAGE,
  functionName,
  page,
});

export const setStartCallsPage = (functionName, start) => ({
  type: types.SET_START_CALLS_PAGE,
  functionName,
  start,
});

export const previousCallsPagination = functionName => (dispatch, getState) => {
  const state = getState();
  const start = getStartCallsPage(state, functionName);
  const jumpTo =
    start - VISIBLE_PAGES_NUMBER_LIMIT < 0
      ? 0
      : start - VISIBLE_PAGES_NUMBER_LIMIT;
  dispatch(setStartCallsPage(functionName, jumpTo));
};

export const nextCallsPagination = functionName => (dispatch, getState) => {
  const state = getState();
  const start = getStartCallsPage(state, functionName);
  const count = getCountCallsPages(state, functionName);
  const jumpTo =
    start + VISIBLE_PAGES_NUMBER_LIMIT + VISIBLE_PAGES_NUMBER_LIMIT > count
      ? count - VISIBLE_PAGES_NUMBER_LIMIT
      : start + VISIBLE_PAGES_NUMBER_LIMIT;
  dispatch(setStartCallsPage(functionName, jumpTo));
};

export const setLastAsCurrentPage = functionName => (dispatch, getState) => {
  const state = getState();
  const count = getCountCallsPages(state, functionName);
  const start = getStartCallsPage(state, functionName);

  dispatch(setCallsPage(functionName, count));
  if (count >= start + VISIBLE_PAGES_NUMBER_LIMIT) {
    // eslint-disable-next-line
    dispatch(
      // eslint-disable-next-line
      setStartCallsPage(functionName, count - VISIBLE_PAGES_NUMBER_LIMIT + 1),);
  }
};

export const toggleExpandItem = (monitored, item) => (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const index = getCurrentCallsPage(state, functionName);
  const currentCallsForFunction = getCurrentCallsForFunction(
    state,
    functionName,
  );

  const updatedItems = currentCallsForFunction.sort.items.map((call) => {
    if (call.id === item.id) {
      return {
        ...call,
        expanded: !call.expanded,
      };
    }
    return call;
  });

  dispatch(toggleExpand(functionName, updatedItems, index));
};

export const toggleCallsTracing = monitored => async (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const control = getFunctionControl(state, functionName);
  const nextControl = await determineNextControlSwitch(
    dispatch,
    control,
    monitored,
  );
  dispatch(setCallsControl({ [functionName]: nextControl }));
};

export const handleThresholdChange = (monitored, value) => (
  dispatch,
  getState,
) => {
  const state = getState();
  const functionName = monitored.query;
  const { limit, collecting } = getFunctionControl(state, functionName);
  const nextControl = {
    threshold: value,
    limit,
    collecting,
  };
  dispatch(setCallsControl({ [functionName]: nextControl }));
};

export const handleLimitChange = (monitored, value) => (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const { threshold, collecting } = getFunctionControl(state, functionName);
  const nextControl = {
    threshold,
    limit: value,
    collecting,
  };
  dispatch(setCallsControl({ [functionName]: nextControl }));
};

export const sortCallsBy = (monitored, column) => (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const index = getCurrentCallsPage(state, functionName);
  const currentCallsForFunction = getCurrentCallsForFunction(
    state,
    functionName,
  );
  const order =
    currentCallsForFunction.sort.column === column &&
    currentCallsForFunction.sort.order === SORT.ASCENDING
      ? SORT.DESCENDING
      : SORT.ASCENDING;

  const sortLastCalls = {
    ...currentCallsForFunction,
    sort: {
      items: sortItems(currentCallsForFunction.items, column, order),
      column,
      order,
    },
  };

  dispatch(updateCurrentCallsForFunction(functionName, sortLastCalls, index));
};
