import { sortBy } from 'lodash';
import { CAPTURE_CALLS_ACTION, DPS_ACTION, SORT } from '../constants';

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

export const parseToMfa = fullName => [
  fullName.split(':')[0],
  fullName.split('/')[0].split(':')[1],
  +fullName.split('/')[1],
  fullName,
];

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

export const callsDecision = (json, lastCalls) => {
  const lastCaptureId = lastCalls ? lastCalls.capture_id : undefined;
  let decision;
  if (json.capture_id > 0) {
    if (!lastCaptureId && !json.has_more) {
      decision = CAPTURE_CALLS_ACTION.APP_INITIALIZATION;
    } else if (!lastCaptureId) {
      decision = CAPTURE_CALLS_ACTION.START_FIRST_CALLS_CAPTURE;
    } else if (json.capture_id !== lastCaptureId) {
      decision = CAPTURE_CALLS_ACTION.START_NEXT_CALLS_CAPTURE;
    } else if (json.items.length && json.has_more) {
      decision = CAPTURE_CALLS_ACTION.CAPTURING;
    } else if (json.items.length && !json.has_more) {
      decision = CAPTURE_CALLS_ACTION.LAST_CALLS_CAPTURE;
    }
  }
  return decision;
};

export const dpsDecision = (dps, ts) => {
  let decision;
  if (ts === 0) {
    decision = DPS_ACTION.FIRST_DPS;
  } else if (dps[0].time - ts > 1) {
    decision = DPS_ACTION.MISSING_DPS;
  } else if (dps[0].time - ts === 1) {
    decision = DPS_ACTION.CONTINUOUS_DPS;
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

export const sortItems = (items, column, order) =>
  (order === SORT.ASCENDING
    ? sortBy(items, column)
    : sortBy(items, column).reverse());

export function roll(func) {
  const r = Math.trunc(Math.random() * 100);
  if (document.getElementById(`grid-${r}`) || r === 0) {
    func();
  }
  return r;
}

export const getAssociatedID = (arr, query) => {
  let r = null;
  Object.entries(arr).forEach((a) => {
    const [q, v] = a;
    if (q === query) {
      r = v;
    }
    return r;
  });
  return r;
};
