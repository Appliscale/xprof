import { isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { startMonitoringFunction, addNotification } from './';
import { NOTIFICATIONS } from '../constants';

const addCallees = callees => ({
  type: types.ADD_CALLEES,
  callees,
});

export const showCallees = functionName => ({
  type: types.SHOW_FUNCTIONS_CALLES,
  functionName,
});

export const hideCallees = functionName => ({
  type: types.HIDE_FUNCTIONS_CALLES,
  functionName,
});

export const calleeClick = callee => (dispatch) => {
  dispatch(startMonitoringFunction(callee));
};

export const getCalleesForFunctions = collection => async (dispatch) => {
  const callees = {};

  await Promise.all(collection.map(async (monitored) => {
    const fun = monitored.query;

    const { json, error } = await XProf.getFunctionsCallees(
      monitored.mfa[0],
      monitored.mfa[1],
      monitored.mfa[2],
    );

    if (error) {
      dispatch(addNotification(
        NOTIFICATIONS.CALLEES.SEVERITY,
        NOTIFICATIONS.CALLEES.MESSAGE(monitored.mfa.query),
      ));
    } else if (json.length) {
      callees[fun] = json;
    } else {
      dispatch(addNotification(
        NOTIFICATIONS.NO_CALLEES.SEVERITY,
        NOTIFICATIONS.NO_CALLEES.MESSAGE(monitored.query),
      ));
    }
  }));

  if (!isEmpty(callees)) dispatch(addCallees(callees));
};
