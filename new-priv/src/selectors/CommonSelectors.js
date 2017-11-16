// entities selectors
export const getQuery = state => state.navigation.query;
export const getStatus = state => state.status.status;
export const getACfunctions = state => state.navigation.functions;
export const getACposition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getACposition(state) !== -1 ? state.navigation.functions[getACposition(state)] : undefined);
export const getMfas = state => state.monitoring.mfas;
export const getData = state => state.monitoring.data;
