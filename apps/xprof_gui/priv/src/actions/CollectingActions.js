import { isEqual, isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { getAllMonitored, getData, getCalls } from '../selectors';
import { setCallsControl, getCalleesForFunctions } from './';
import { determineNextData, determineNextCalls } from '../utils';

export const updateListMonitoringFunctions = monitoredCollection => ({
  type: types.UPDATE_MONITORED_FUNCTIONS,
  monitoredCollection,
});

const updateData = data => ({
  type: types.UPDATE_DATA,
  data,
});

const updateCalls = calls => ({
  type: types.UPDATE_CALLS,
  calls,
});

export const getMonitoredFunctions = () => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);

  const { json, error } = await XProf.getAllMonitoredFunctions();

  if (error) {
    console.log('ERROR: ', error);
  } else if (!isEqual(monitoredCollection, json)) {
    const queries = monitoredCollection.map(monitored => monitored.query);
    const newMonitoredCollection = json
      .filter(monitored => !queries
        .includes(monitored.query));
    const newControls = newMonitoredCollection.reduce(
      (control, monitored) => ({
        ...control,
        [monitored.query]: {
          threshold: undefined,
          limit: undefined,
          collecting: false,
        },
      }),
      {},
    );

    dispatch(getCalleesForFunctions(newMonitoredCollection));
    dispatch(setCallsControl(newControls));
    dispatch(updateListMonitoringFunctions(json));
  }
};

export const getFunctionsData = () => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const data = getData(state);
  const nextData = await determineNextData(monitoredCollection, data);

  if (!isEmpty(nextData)) {
    dispatch(updateData({ ...data, ...nextData }));
  }
};

export const getFunctionsCalls = () => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const calls = getCalls(state);
  const nextCalls = await determineNextCalls(
    dispatch,
    state,
    monitoredCollection,
    calls,
  );

  if (!isEmpty(nextCalls)) {
    dispatch(updateCalls({ ...calls, ...nextCalls }));
  }
};
