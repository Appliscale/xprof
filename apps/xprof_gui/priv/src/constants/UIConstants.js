import { SPEC } from './';

export const MAX_FUNCTIONS_AUTOCOMPLETER = 100;
export const HANDLED_KEYS = {
  ESC: 27,
  RETURN: 13,
  TAB: 9,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
};
export const HANDLED_KEY_CODES = Object.values(HANDLED_KEYS);
export const CALLS_COLUMNS = {
  ID: 'id',
  PID: 'pid',
  CALL_TIME: 'call_time',
  ARGS: 'args',
  RES: 'res',
};
export const SWITCH_INPUT_TYPE_HOTKEY = 'ctrl+i';
export const NOTIFICATIONS_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};
export const NOTIFICATIONS = {
  TIMEOUT: 3000,
  MONITORED_FUNCTIONS: {
    SEVERITY: NOTIFICATIONS_SEVERITY.ERROR,
    MESSAGE: "Couldn't get monitored functions.",
  },
  MONITORING: {
    SEVERITY: NOTIFICATIONS_SEVERITY.ERROR,
    MESSAGE: fun => `Couldn't stop monitoring function "${fun}".`,
  },
  MODE: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: "Couldn't detect language mode.",
  },
  START_MONITORING: {
    SEVERITY: NOTIFICATIONS_SEVERITY.ERROR,
    MESSAGE: fun => `Couldn't start monitoring function "${fun}".`,
  },
  CALLEES: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Couldn't get callees of function "${fun}".`,
  },
  SAMPLES: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Couldn't get samples of function "${fun}".`,
  },
  CALLS: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Couldn't get calls of function "${fun}".`,
  },
  STOP_CAPTURING_CALLS: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Couldn't stop call capturing of function "${fun}".`,
  },
  START_CAPTURING_CALLS: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Couldn't start call capturing of function "${fun}".`,
  },
  CHANGE_TRACING_STATUS: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: spec =>
      (spec === SPEC.PAUSE
        ? "Couldn't pause tracing."
        : "Couldn't start tracing."),
  },
  NO_CALLEES: {
    SEVERITY: NOTIFICATIONS_SEVERITY.INFO,
    MESSAGE: fun => `Function "${fun}" doesn't call any functions.`,
  },
  LOST_CONNECTION: 'Lost connection to XProf!',
  ALIVE_CONNECTION: 'Connection to XProf is back!',
  SWITCH_GRID: {
    SEVERITY: NOTIFICATIONS_SEVERITY.INFO,
    MESSAGE: columns =>
      (columns === 1
        ? 'The grid has been changed to 1 graph per row'
        : `The grid has been changed to ${columns} graphs per row`),
  },
  UPDATED_FAVOURITES: {
    SEVERITY: NOTIFICATIONS_SEVERITY.INFO,
    MESSAGE: 'List of favourites function has been updated',
  },
  UPDATE_FAVOURITES_ERROR: {
    SEVERITY: NOTIFICATIONS_SEVERITY.ERROR,
    MESSAGE: "Couldn't update list of favourites functions",
  },
};
export const PLACEHOLDER = {
  MODE_DETECTED: (language, inputType, example) =>
    'Hello BEAMer! I have detected that you are using an ' +
    `${language} project, please specify your ${inputType} ` +
    `here e.g. ${example}`,
  MODE_UNKNOWN: 'Hello BEAMer! Please specify your trace pattern here.',
  HAVE_FAVOURITES: 'Hello BEAMer! Search your favourites queries.',
  DONT_HAVE_FAVOURITES: "Hello BEAMer! You don't have favourites queries.",
};
export const VISIBLE_PAGES_NUMBER_LIMIT = 5;
export const MAX_GRID = 3;
export const MAX_GRID_SMALLER = 2;
export const GRID_WIDTH_BREAKPOINT = 1280;
export const INPUT_TYPE = {
  SEARCH: 'search',
  FAVOURITES: 'favourites',
};
