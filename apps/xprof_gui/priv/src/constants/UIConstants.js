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
  FUNCTION_DOESNOT_EXIST: {
    SEVERITY: NOTIFICATIONS_SEVERITY.WARNING,
    MESSAGE: fun => `Function "${fun}" doesn't exist.`,
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
};
export const MODE_DETECTED = (language, inputType, example) =>
  'Hello BEAMer! I have detected that you are using an ' +
  `${language} project, please specify your ${inputType} ` +
  `here e.g. ${example}`;
export const MODE_UNKNOWN =
  'Hello BEAMer! Please specify your trace pattern here.';
export const VISIBLE_PAGES_NUMBER_LIMIT = 5;
