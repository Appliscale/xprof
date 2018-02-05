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

export const getCallees = mfa => async (dispatch) => {
  const name = mfa[3];

  const { json, error } = await XProf.getFunctionsCallees(
    mfa[0],
    mfa[1],
    mfa[2],
  );

  if (error) console.log('ERROR');
  else if (json.length) dispatch(addCallees({ [name]: json }));
  else console.log('NO CALLES FOUND!');
};
