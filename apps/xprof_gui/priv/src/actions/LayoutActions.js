import * as types from '../constants/ActionTypes';
import {
  GRID_WIDTH_BREAKPOINT,
  MAX_GRID_SMALLER,
  MAX_GRID,
  NOTIFICATIONS,
} from '../constants';
import { getGrid, getNumberOfMonitoredFunctions } from '../selectors';
import { addNotification } from './';

export const expandGraphPanel = functionName => ({
  type: types.EXPAND_GRAPH_PANEL,
  functionName,
});

export const shrinkGraphPanel = functionName => ({
  type: types.SHRINK_GRAPH_PANEL,
  functionName,
});

export const expandTracingPanel = functionName => ({
  type: types.EXPAND_TRACING_PANEL,
  functionName,
});

export const shrinkTracingPanel = functionName => ({
  type: types.SHRINK_TRACING_PANEL,
  functionName,
});

export const setGrid = grid => ({
  type: types.SET_GRID,
  grid,
});

const calcNextGrid = (curr, breakpoint, length) =>
  (curr < breakpoint && curr < length ? curr + 1 : 1);

export const switchGrid = () => async (dispatch, getState) => {
  const state = getState();
  const currentGrid = getGrid(state);
  const numberOfMonitoredFunctions = getNumberOfMonitoredFunctions(state);

  const width = window.innerWidth;
  const nextGrid =
    width < GRID_WIDTH_BREAKPOINT
      ? calcNextGrid(currentGrid, MAX_GRID_SMALLER, numberOfMonitoredFunctions)
      : calcNextGrid(currentGrid, MAX_GRID, numberOfMonitoredFunctions);

  dispatch(setGrid(nextGrid));
  dispatch(addNotification(
    NOTIFICATIONS.SWITCH_GRID.SEVERITY,
    NOTIFICATIONS.SWITCH_GRID.MESSAGE(nextGrid),
  ));
};
