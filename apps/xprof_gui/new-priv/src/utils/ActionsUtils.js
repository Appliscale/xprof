import { isEmpty, sortBy, last, takeRight, initial, range } from 'lodash';
import { callsDecision, dpsDecision } from '../utils/CommonUtils';
import { getLastCallsForFunction } from '../selectors/CommonSelectors';
import { CAPTURE_CALLS_ACTION, DPS_LIMIT, DPS_ACTION } from '../constants';
import { updateCallsControl } from '../actions/TracingActions';
import * as XProf from '../api/XProf';

const determineNextCallsForFun = (json, lastCalls, calls, name) => {
  let callsForFun;
  switch (callsDecision(json, lastCalls)) {
    case CAPTURE_CALLS_ACTION.APP_INITIALIZATION:
    case CAPTURE_CALLS_ACTION.START_FIRST_CALLS_CAPTURE:
      callsForFun = [
        {
          capture_id: json.capture_id,
          items: json.items.map(item => ({ ...item, expanded: false })),
          has_more: json.has_more,
        },
      ];
      break;
    case CAPTURE_CALLS_ACTION.START_NEXT_CALLS_CAPTURE:
      callsForFun = [
        ...calls[name],
        {
          capture_id: json.capture_id,
          items: json.items.map(item => ({ ...item, expanded: false })),
          has_more: json.has_more,
        },
      ];
      break;
    case CAPTURE_CALLS_ACTION.CAPTURING:
    case CAPTURE_CALLS_ACTION.LAST_CALLS_CAPTURE:
      callsForFun = [
        ...initial(calls[name]),
        {
          capture_id: lastCalls.capture_id,
          items: [
            ...lastCalls.items,
            ...json.items.map(item => ({ ...item, expanded: false })),
          ],
          has_more: json.has_more,
        },
      ];
      break;
    default:
      break;
  }
  return callsForFun;
};

const determineNextControl = (json, lastcalls) => {
  let control;
  switch (callsDecision(json, lastcalls)) {
    case CAPTURE_CALLS_ACTION.APP_INITIALIZATION:
    case CAPTURE_CALLS_ACTION.LAST_CALLS_CAPTURE:
      control = {
        threshold: undefined,
        limit: undefined,
        collecting: false,
      };
      break;
    case CAPTURE_CALLS_ACTION.START_FIRST_CALLS_CAPTURE:
    case CAPTURE_CALLS_ACTION.START_NEXT_CALLS_CAPTURE:
      control = {
        threshold: json.threshold.toString(),
        limit: json.limit.toString(),
        collecting: true,
      };
      break;
    default:
      break;
  }
  return control;
};

const determineIncomingDps = (dps, ts) => {
  let missingDps;
  let mergedDps;
  const zeros = {
    min: 0,
    mean: 0,
    median: 0,
    max: 0,
    stddev: 0,
    p25: 0,
    p50: 0,
    p75: 0,
    p90: 0,
    p99: 0,
    p9999999: 0,
    memsize: 0,
    count: 0,
  };

  switch (dpsDecision(dps, ts)) {
    case DPS_ACTION.FIRST_DPS:
      missingDps = range(dps[0].time - DPS_LIMIT, dps[0].time).map(time => ({
        ...zeros,
        time,
      }));
      mergedDps = [...missingDps, ...dps];
      break;
    case DPS_ACTION.MISSING_DPS:
      missingDps = range(ts + 1, dps[0].time).map(time => ({
        ...zeros,
        time,
      }));
      mergedDps = [...missingDps, ...dps];
      break;
    case DPS_ACTION.CONTINUOUS_DPS:
      mergedDps = dps;
      break;
    default:
      break;
  }
  return mergedDps.map(sample => ({
    ...sample,
    time: sample.time * 1000,
  }));
};

export const determineNextData = async (mfas, data) => {
  const nextData = {};

  await Promise.all(mfas.map(async (mfa) => {
    const completeFunName = mfa[3];
    const currentDps = data[completeFunName];
    const lastTs =
        currentDps && currentDps.length ? last(currentDps).time / 1000 : 0;

    const { json, error } = await XProf.getFunctionsSamples(
      mfa[0],
      mfa[1],
      mfa[2],
      lastTs,
    );
    if (error) {
      console.log('ERROR: ', error);
    } else if (json.length) {
      const incomingDpsSorted = sortBy(json, 'time');
      const incomingDps = determineIncomingDps(incomingDpsSorted, lastTs);
      const concatenatedDps = currentDps
        ? [...currentDps, ...incomingDps]
        : incomingDps;
      const nextDps = takeRight(concatenatedDps, DPS_LIMIT);
      nextData[completeFunName] = nextDps;
    }
  }));

  return nextData;
};

export const determineNextCalls = async (dispatch, state, mfas, calls) => {
  const nextCalls = {};

  await Promise.all(mfas.map(async (mfa) => {
    const completeFunName = mfa[3];
    const lastCalls = getLastCallsForFunction(state, completeFunName);

    const offset =
        lastCalls && lastCalls.items.length ? last(lastCalls.items).id : 0;

    const { json, error } = await XProf.getFunctionsCalls(
      mfa[0],
      mfa[1],
      mfa[2],
      offset,
    );
    if (error) {
      console.log('ERROR: ', error);
    } else {
      const nextControlForFun = determineNextControl(json, lastCalls);
      if (!isEmpty(nextControlForFun)) {
        dispatch(updateCallsControl(completeFunName, nextControlForFun));
      }

      const nextCallsForFun = determineNextCallsForFun(
        json,
        lastCalls,
        calls,
        completeFunName,
      );
      if (!isEmpty(nextCallsForFun)) {
        nextCalls[completeFunName] = nextCallsForFun;
      }
    }
  }));

  return nextCalls;
};

export const determineNextControlSwitch = async (control, mfa) => {
  const { threshold, limit, collecting } = control;
  const nextControl = { ...control };

  if (collecting) {
    const { error } = await XProf.stopCapturingFunctionsCalls(
      mfa[0],
      mfa[1],
      mfa[2],
    );
    if (error) console.log('ERROR: ', error);
    nextControl.collecting = false;
  } else {
    const { error } = await XProf.startCapturingFunctionsCalls(
      mfa[0],
      mfa[1],
      mfa[2],
      threshold,
      limit,
    );
    if (error) console.log('ERROR: ', error);
    nextControl.collecting = true;
  }

  return nextControl;
};
