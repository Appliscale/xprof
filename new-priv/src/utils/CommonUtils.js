import { CAPTURE_ACTION } from '../constants/index';

const commonPrefix = (string1, string2) => {
  const len = string1.length;
  let i = 0;

  while (i < len && string1.charAt(i) === string2.charAt(i)) {
    i += 1;
  }
  return string1.substring(0, i);
};
export const commonArrayPrefix = (sortedArray) => {
  const string1 = sortedArray[0];
  const string2 = sortedArray[sortedArray.length - 1];
  return commonPrefix(string1, string2);
};

export const isMfa = str => str.includes(':') && str.includes('/');
export const getLanguageGuides = (mode) => {
  if (!mode) {
    return {
      language: null,
      type: null,
      example: null,
    };
  } else if (mode === 'elixir') {
    return {
      language: 'Elixir',
      type: 'query',
      example: 'Enum.member?(_, :test)',
    };
  }
  return {
    language: 'Erlang',
    type: 'trace pattern',
    example: 'ets:lookup(data, _)',
  };
};
export const captureDecision = (json, lastCapture) => {
  const lastCaptureId = lastCapture ? lastCapture.captureId : undefined;
  let decision;
  if (json && json.capture_id > 0) {
    if (!lastCaptureId && !json.has_more) {
      decision = CAPTURE_ACTION.APP_INITIALIZATION;
    } else if (!lastCaptureId) {
      decision = CAPTURE_ACTION.START_FIRST_CAPTURE;
    } else if (json.capture_id !== lastCaptureId) {
      decision = CAPTURE_ACTION.START_NEXT_CAPTURE;
    } else if (json.items.length) {
      decision = CAPTURE_ACTION.CAPTURING;
    }
  }
  return decision;
};
export const isIntegerInRange = (value, lowerLimit, upperLimit) => {
  const numVal = Number(value);
  if (Number.isInteger(numVal)) {
    return numVal <= upperLimit && numVal >= lowerLimit;
  }
  return false;
};
