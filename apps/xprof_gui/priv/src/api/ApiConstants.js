const API_HOSTNAME =
  process.env.NODE_ENV === 'production'
    ? window.origin
    : 'http://localhost:7890';

export const FUNCTION_AUTOEXPANSION = `${API_HOSTNAME}/api/funs`;
export const START_MONITORING_FUNCTION = `${API_HOSTNAME}/api/mon_start`;
export const STOP_MONITORING_FUNCTION = `${API_HOSTNAME}/api/mon_stop`;
export const ALL_MONITORED_FUNCTIONS = `${API_HOSTNAME}/api/mon_get_all`;
export const GET_MONITORED_FUNCTION_DATA = `${API_HOSTNAME}/api/data`;
export const SET_TRACING_STATUS = `${API_HOSTNAME}/api/trace_set`;
export const GET_TRACING_STATUS = `${API_HOSTNAME}/api/trace_status`;
export const STOP_CAPTURING_CALLS = `${API_HOSTNAME}/api/capture_stop`;
export const GET_CALLS_FUNCTION = `${API_HOSTNAME}/api/capture_data`;
export const START_CAPTURING_CALLS = `${API_HOSTNAME}/api/capture`;
export const LANGUANGE_MODE = `${API_HOSTNAME}/api/mode`;
export const GET_FUNCTIONS_CALLEES = `${API_HOSTNAME}/api/get_callees`;
export const GET_MODE = `${API_HOSTNAME}/api/mode`;
