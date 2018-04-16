import * as URL from './ApiConstants';
import * as request from './ApiUtils';

/**
   * Get loaded modules and functions (MFAs) that match the query string.
   *
   * @param query
   * @return Array with functions. Example: []
   */
export const getFunctionAutoexpansion = async query =>
  request.get(URL.FUNCTION_AUTOEXPANSION, { query });
/**
   * Get list of monitored functions.
   *
   * @return Array with functions. Example: []
   */
export const getAllMonitoredFunctions = async () =>
  request.get(URL.ALL_MONITORED_FUNCTIONS);
export const startMonitoringFunction = async query =>
  request.get(URL.START_MONITORING_FUNCTION, { query });
export const stopMonitoringFunction = async (mod, fun, arity) =>
  request.get(URL.STOP_MONITORING_FUNCTION, { mod, fun, arity });
export const getTracingStatus = async () => request.get(URL.GET_TRACING_STATUS);
export const setTracingStatus = async spec =>
  request.get(URL.SET_TRACING_STATUS, { spec });
export const getFunctionsSamples = async (mod, fun, arity, lastTimestamp) =>
  request.get(URL.GET_MONITORED_FUNCTION_DATA, {
    mod,
    fun,
    arity,
    last_ts: lastTimestamp,
  });
export const getFunctionsCalls = async (mod, fun, arity, offset) =>
  request.get(URL.GET_CALLS_FUNCTION, {
    mod,
    fun,
    arity,
    offset,
  });
export const startCapturingFunctionsCalls = async (
  mod,
  fun,
  arity,
  threshold,
  limit,
) =>
  request.get(URL.START_CAPTURING_CALLS, {
    mod,
    fun,
    arity,
    threshold,
    limit,
  });
export const stopCapturingFunctionsCalls = (mod, fun, arity) =>
  request.get(URL.STOP_CAPTURING_CALLS, { mod, fun, arity });
export const getFunctionsCallees = (mod, fun, arity) =>
  request.get(URL.GET_FUNCTIONS_CALLEES, { mod, fun, arity });
export const getMode = async () => request.get(URL.GET_MODE);
