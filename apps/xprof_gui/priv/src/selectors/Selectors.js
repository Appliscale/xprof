import { last } from 'lodash';

// status
export const getStatus = state => state.status.status;

// tracing
export const getFunctionControl = (state, fun) => state.tracing.controls[fun];
export const getCalls = state => state.tracing.calls;
export const getFunctionCalls = (state, fun) => state.tracing.calls[fun];
export const getLastCallsForFunction = (state, fun) =>
  (state.tracing.calls[fun] ? last(state.tracing.calls[fun]) : undefined);

// monitoring
export const getAllMonitored = state => state.monitoring.monitoredCollection;
export const getNumberOfMonitoredFunctions = state =>
  state.monitoring.monitoredCollection.length;
export const getData = state => state.monitoring.data;
export const getFunctionData = (state, fun) => state.monitoring.data[fun];
export const getIDs = state => state.monitoring.ids;
export const getSize = state => state.monitoring.size;
export const getFunctionY = (state, fun) => state.monitoring.y[fun];

// navigation
export const getQuery = state => state.navigation.query;
export const getCommonExpansion = state => state.navigation.expansion;
export const getACfunctions = state => state.navigation.functions || [];
export const getPromptPosition = state => state.navigation.position;
export const getHighlightedFunction = state =>
  (getPromptPosition(state) > -1
    ? state.navigation.functions[getPromptPosition(state)]
    : undefined);
export const getLanguage = state => state.navigation.language;
export const getInputType = state => state.navigation.inputType;
export const getExample = state => state.navigation.example;
export const getRecentQueries = state => state.navigation.history;
export const getDirtyInput = state => state.navigation.dirtyInput;
export const getSelectedInputType = state => state.navigation.selectedInputType;
export const getFavourites = state => state.navigation.favourites;
export const isFavourite = (state, fun) => getFavourites(state).includes(fun);

// explore
export const getCallees = state => state.explore.callees;
export const getFunctionCallees = (state, fun) => state.explore.callees[fun];
export const getFunctionCalleesVisibility = (state, fun) =>
  state.explore.visibility[fun];

// layout
export const getFunctionGraphVisibility = (state, fun) =>
  state.layout.graphVisibility[fun];
export const getFunctionTracingVisibility = (state, fun) =>
  state.layout.tracingVisibility[fun];
export const getGrid = state => state.layout.grid;

// notification
export const getNotifications = state => state.notification.notifications;
export const getNotificationsLastId = state =>
  (state.notification.notifications.length
    ? last(state.notification.notifications).id
    : 0);
export const isConnection = state => state.notification.connection;
export const getConnectionsNotificationVisibility = state =>
  state.notification.showConnectionNotification;
