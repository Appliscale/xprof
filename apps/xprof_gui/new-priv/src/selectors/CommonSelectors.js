// entities selectors
import { last } from 'lodash';

export const getQuery = state => state.navigation.query;
export const getShowFavourites = state => state.navigation.showFavourites;
export const getStatus = state => state.status.status;
export const getACfunctions = state => state.navigation.functions;
export const getACposition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getACposition(state) !== -1
    ? state.navigation.functions[getACposition(state)]
    : undefined);
export const getMfas = state => state.monitoring.mfas;
export const getData = state => state.monitoring.data;
export const getFavourites = state => state.favourites.favourites;
export const getCapture = state => state.tracing.capture;
export const getCaptureFunction = (state, fun) => state.tracing.capture[fun];
export const getLastCaptureForFunction = (state, fun) =>
  (state.tracing.capture[fun] ? last(state.tracing.capture[fun]) : undefined);
export const getLastItems = (state, fun) =>
  last(state.tracing.capture[fun]).items;
export const getControlForFunction = (state, fun) => ({
  threshold: state.tracing.controls[fun].threshold,
  limit: state.tracing.controls[fun].limit,
});
export const getControls = state => state.tracing.controls;
