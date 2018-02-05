import { last } from 'lodash';

// status
export const getStatus = state => state.status.status;

// tracing
export const getControls = state => state.tracing.controls;
export const getFunctionsControl = (state, fun) => state.tracing.controls[fun];
export const getCalls = state => state.tracing.calls;
export const getLastCallsForFunction = (state, fun) =>
  (state.tracing.calls[fun] ? last(state.tracing.calls[fun]) : undefined);

// monitoring
export const getMfas = state => state.monitoring.mfas;
export const getData = state => state.monitoring.data;

// navigation
export const getQuery = state => state.navigation.query;
export const getACfunctions = state => state.navigation.functions;
export const getACposition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getACposition(state) !== -1
    ? state.navigation.functions[getACposition(state)]
    : undefined);

// explore
export const getCallees = state => state.explore.callees;
export const getFunctionsCallees = (state, fun) => state.explore.callees[fun];
export const getCalleesVisibility = state => state.explore.visibility;

// layout
export const getGraphVisibility = state => state.layout.graphVisibility;
export const getTracingVisibility = state => state.layout.tracingVisibility;
