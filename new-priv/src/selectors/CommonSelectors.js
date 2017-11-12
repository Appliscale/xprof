// entities selectors
export const getQuery = state => state.navigation.query;
export const getStatus = state => state.navigation.status;
export const getACfunctions = state => state.navigation.functions;
export const getACposition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getACposition(state) !== -1 ? state.navigation.functions[getACposition(state)] : undefined);
export const a = 1;
