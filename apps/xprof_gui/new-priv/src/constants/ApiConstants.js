const API_HOSTNAME = 'http://localhost:7890';

export const FUNCTION_AUTOEXPANSION_URL = `${API_HOSTNAME}/api/funs`;
export const START_MONITORING_FUNCTION_URL = `${API_HOSTNAME}/api/mon_start`;
export const STOP_MONITORING_FUNCTION_URL = `${API_HOSTNAME}/api/mon_stop`;
export const ALL_MONITORED_FUNCTIONS_URL = `${API_HOSTNAME}/api/mon_get_all`;
export const MONITORED_FUNCTION_DATA_URL = `${API_HOSTNAME}/api/data`;
export const SET_TRACING_STATUS_URL = `${API_HOSTNAME}/api/trace_set`;
export const GET_TRACING_STATUS_URL = `${API_HOSTNAME}/api/trace_status`;
export const STOP_CAPTURE_URL = `${API_HOSTNAME}/api/capture_stop`;
export const CAPTURE_FUNCTION_DATA_URL = `${API_HOSTNAME}/api/capture_data`;
export const START_CAPTURE_URL = `${API_HOSTNAME}/api/capture`;
export const LANGUANGE_MODE_URL = `${API_HOSTNAME}/api/mode`;
export const ADD_FAVOURITE_FUNCTION_URL = `${API_HOSTNAME}/api/fav_add`;
export const REMOVE_FAVOURITE_FUNCTION_URL = `${API_HOSTNAME}/api/fav_remove`;
export const ALL_FAVOURITE_FUNCTIONS_URL = `${API_HOSTNAME}/api/fav_get_all`;
export const FAVOURITES_ENABLED_URL = `${API_HOSTNAME}/api/fav_enabled`;
