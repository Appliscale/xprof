import { isEqual, isEmpty } from 'lodash';
import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import {
  getAllMonitored,
  getData,
  getCalls,
  getIDs,
  getStatus,
  isConnection,
} from '../selectors';
import {
  setCallsControl,
  getCalleesForFunctions,
  addNotification,
  setPaginations,
} from './';
import {
  determineNextData,
  determineNextCalls,
  roll,
  safecomposeID,
} from '../utils';
import { STATUS, NOTIFICATIONS } from '../constants';

export const updateListMonitoringFunctions = monitoredCollection => ({
  type: types.UPDATE_MONITORED_FUNCTIONS,
  monitoredCollection,
});

const updateData = data => ({
  type: types.UPDATE_DATA,
  data,
});

export const addY = y => ({
  type: types.ADD_Y,
  y,
});

const updateCalls = calls => ({
  type: types.UPDATE_CALLS,
  calls,
});

const updateIDs = ids => ({
  type: types.ASSIGN_GRAPH_ID,
  ids,
});

const updateSize = (property, value) => ({
  type: types.CHANGE_SIZE,
  property,
  value,
});

export const getMonitoredFunctions = () => async (dispatch, getState) => {
  const state = getState();
  const ids = getIDs(state);
  const identifiedFunctions = Object.keys(ids);
  const monitoredCollection = getAllMonitored(state);
  const isConn = isConnection(state);

  monitoredCollection.forEach((monitored) => {
    if (!identifiedFunctions.includes(monitored.query)) {
      const id = safecomposeID(monitored.query);
      ids[monitored.query] = id;
    }
  });

  if (isConn) {
    const { json, error } = await XProf.getAllMonitoredFunctions();
    if (error) {
      dispatch(addNotification(
        NOTIFICATIONS.MONITORED_FUNCTIONS.SEVERITY,
        NOTIFICATIONS.MONITORED_FUNCTIONS.MESSAGE,
      ));
    } else if (!isEqual(monitoredCollection, json)) {
      const queries = monitoredCollection.map(monitored => monitored.query);
      const newColl = json.filter(m => !queries.includes(m.query));
      const newControls = newColl.reduce(
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
      const newPaginations = newColl.reduce(
        (paginations, monitored) => ({
          ...paginations,
          [monitored.query]: {
            current: 0,
            start: 0,
          },
        }),
        {},
      );

      dispatch(updateIDs(ids));
      dispatch(getCalleesForFunctions(newColl));
      dispatch(setCallsControl(newControls));
      dispatch(setPaginations(newPaginations));
      dispatch(updateListMonitoringFunctions(json));
    }
  }
};

export const getFunctionsData = () => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const data = getData(state);
  const isConn = isConnection(state);
  const running = getStatus(state) === STATUS.RUNNING;
  const nextData =
    isConn &&
    running &&
    (await determineNextData(dispatch, monitoredCollection, data));

  if (!isEmpty(nextData)) {
    dispatch(updateData({ ...data, ...nextData }));
  }
};

export const getFunctionsCalls = () => async (dispatch, getState) => {
  const state = getState();
  const monitoredCollection = getAllMonitored(state);
  const calls = getCalls(state);
  const isConn = isConnection(state);
  const running = getStatus(state) === STATUS.RUNNING;
  const nextCalls =
    isConn &&
    running &&
    (await determineNextCalls(dispatch, state, monitoredCollection, calls));

  if (!isEmpty(nextCalls)) {
    dispatch(updateCalls({ ...calls, ...nextCalls }));
  }
};

export const setIDs = () => async (dispatch, getState) => {
  /*
    IDs is an object containing key-value pairs where the key
    is function name and the value is a forever associated random number
    from the range 0-100; as the D3 is working on the whole document context,
    literally every graph element should have a unique ID
    (if not, the animation will be passed only to the lastly invoked);
    we could pass the MFA as the ID suffix but when we iterate over
    huge dataset of rectangles and every of them is referenced by ID,
    we have to find a shorter suffix - so instead of passing
    long function name, we are passing a random number (but checking if
    is it unique number for the whole document; we are securing ourselves by
    setting the range to 0-100 - the user will be unable to open 100 graphs
    at once)
  */
  const state = getState();
  const ids = getIDs(state);
  const identifiedFunctions = Object.keys(ids);
  const rolledValues = Object.values(ids);
  const monitoredCollection = getAllMonitored(state);

  monitoredCollection.forEach((monitored) => {
    if (!identifiedFunctions.includes(monitored.query)) {
      const randomID = roll(roll, rolledValues);
      ids[monitored.query] = randomID;
    }
  });
  dispatch(updateIDs(ids));
};

export const setSize = reference => async (dispatch) => {
  /*
    This could be done using the ViewBox but setting the
    home-made media queries grants us a lot more control
    and we have only 3 breaks so this is not problematic.
    The 'reference' is the wrapper width.
  */

  let heightFactor = 0;
  let leftFactor = 0;
  let screenFactor = 0;

  switch (true) {
    case window.innerWidth < 460:
      leftFactor = 0.12;
      screenFactor = 0.87;
      heightFactor = 0.27;
      break;
    case window.innerWidth < 1030:
      leftFactor = 0.1;
      screenFactor = 0.87;
      heightFactor = 0.4;
      break;
    default:
      leftFactor = 0.05;
      screenFactor = 0.87;
      heightFactor = 0.27;
      break;
  }

  const newWidth = Math.trunc(reference * screenFactor);
  const newMarginLeft = Math.trunc(reference * leftFactor);
  const newHeight = Math.trunc(newWidth * heightFactor);

  dispatch(updateSize('width', newWidth));
  dispatch(updateSize('height', newHeight));
  dispatch(updateSize('marginLeft', newMarginLeft));
};
