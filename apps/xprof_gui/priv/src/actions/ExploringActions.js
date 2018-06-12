import { isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { startMonitoringFunction } from './';

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

export const getCallees = monitored => async (dispatch) => {
  const name = monitored.query;

  const { json, error } = await XProf.getFunctionsCallees(
    monitored.mfa[0],
    monitored.mfa[1],
    monitored.mfa[2],
  );

  if (error) console.log('ERROR');
  else if (json.length) dispatch(addCallees({ [name]: json }));
  else console.log('NO CALLES FOUND!');
};

export const getCalleesForFunctions = monitoredCollection => async (dispatch,
) => {
  const callees = {};

  await Promise.all(monitoredCollection.map(async (monitored) => {
    const fun = monitored.query;

    const { json, error } = await XProf.getFunctionsCallees(
      monitored.mfa[0],
      monitored.mfa[1],
      monitored.mfa[2],
    );

    if (error) console.log('ERROR');
    else if (json.length) callees[fun] = json;
  }));

  if (!isEmpty(callees)) dispatch(addCallees(callees));
};
