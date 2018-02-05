import * as types from '../constants/ActionTypes';

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
