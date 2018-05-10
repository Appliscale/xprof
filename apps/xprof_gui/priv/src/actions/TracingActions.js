import { getLastCallsForFunction, getFunctionControl } from '../selectors';
import * as types from '../constants/ActionTypes';
import { determineNextControlSwitch, sortItems } from '../utils';
import { SORT } from '../constants';

const toggleExpand = (functionName, updatedItems) => ({
  type: types.TOGGLE_EXPAND_ITEM,
  functionName,
  updatedItems,
});

export const setCallsControl = control => ({
  type: types.SET_CALLS_CONTROL,
  control,
});

const updateLastCallsForFunction = (functionName, sortedCalls) => ({
  type: types.SORT_CALLS,
  functionName,
  sortedCalls,
});

export const toggleExpandItem = (monitored, item) => (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const lastCallsForFunction = getLastCallsForFunction(state, functionName);

  const updatedItems = lastCallsForFunction.sort.items.map((call) => {
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

export const toggleCallsTracing = monitored => async (dispatch, getState) => {
  const state = getState();
  const functionName = monitored.query;
  const control = getFunctionControl(state, functionName);
  const nextControl = await determineNextControlSwitch(control, monitored);
  dispatch(setCallsControl({ [functionName]: nextControl }));
};

export const handleThresholdChange = (monitored, value) =>
  (dispatch, getState) => {
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
  const lastCallsForFunction = getLastCallsForFunction(state, functionName);
  const order =
    lastCallsForFunction.sort.column === column &&
    lastCallsForFunction.sort.order === SORT.ASCENDING
      ? SORT.DESCENDING
      : SORT.ASCENDING;

  const sortLastCalls = {
    ...lastCallsForFunction,
    sort: {
      items: sortItems(lastCallsForFunction.items, column, order),
      column,
      order,
    },
  };

  dispatch(updateLastCallsForFunction(functionName, sortLastCalls));
};
