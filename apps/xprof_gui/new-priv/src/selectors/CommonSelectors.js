// entities selectors
import { last } from 'lodash';

export const getQuery = state => state.navigation.query;
export const getStatus = state => state.status.status;
export const getACfunctions = state => state.navigation.functions;
export const getACposition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getACposition(state) !== -1
    ? state.navigation.functions[getACposition(state)]
    : undefined);
export const getMfas = state => state.monitoring.mfas;
export const getData = state => state.monitoring.data;
export const getCalls = state => state.tracing.calls;
export const getLastCallsForFunction = (state, fun) =>
  (state.tracing.calls[fun] ? last(state.tracing.calls[fun]) : undefined);
export const getFunctionsControl = (state, fun) => state.tracing.controls[fun];
export const getControls = state => state.tracing.controls;
