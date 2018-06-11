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

export const getCalleesForFunctions = mfas => async (dispatch) => {
  const callees = {};

  await Promise.all(mfas.map(async (mfa) => {
    const fun = mfa[3];

    const { json, error } = await XProf.getFunctionsCallees(
      mfa[0],
      mfa[1],
      mfa[2],
    );

    if (error) {
      dispatch(addNotification(
        NOTIFICATIONS.CALLEES.SEVERITY,
        NOTIFICATIONS.CALLEES.MESSAGE(mfa[3]),
      ));
    } else if (json.length) {
      callees[fun] = json;
    } else {
      dispatch(addNotification(
        NOTIFICATIONS.NO_CALLEES.SEVERITY,
        NOTIFICATIONS.NO_CALLEES.MESSAGE(mfa[3]),
      ));
    }
  }));

  if (!isEmpty(callees)) dispatch(addCallees(callees));
};
