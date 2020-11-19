import { isEqual } from 'lodash';

import * as types from '../constants/ActionTypes';
import * as XProf from '../api';
import { addNotification } from './NotificationActions';
import { NOTIFICATIONS } from '../constants';
import { getFavourites as getFavouritesSelector } from '../selectors';

const updateFavourites = favourites => ({
  type: types.UPDATE_FAVOURITES,
  favourites,
});

const removeFromFavourites = async fun => XProf.removeFromFavourites(fun);
const addToFavourites = async fun => XProf.addToFavourites(fun);

export const toggleFavourite = (fun, shouldAdd) => async (dispatch) => {
  const updateFunction = shouldAdd ? addToFavourites : removeFromFavourites;
  const { json, error } = await updateFunction(fun);

  if (error) {
    dispatch(addNotification(
      NOTIFICATIONS.UPDATE_FAVOURITES_ERROR.SEVERITY,
      NOTIFICATIONS.UPDATE_FAVOURITES_ERROR.MESSAGE,
    ));
  } else {
    dispatch(updateFavourites(json));
  }
};

export const getFavourites = () => async (dispatch, getState) => {
  const state = getState();
  const favourites = getFavouritesSelector(state);

  const { json, error } = await XProf.getFavouritesFunctions();

  if (error) {
    dispatch(addNotification(
      NOTIFICATIONS.UPDATE_FAVOURITES_ERROR.SEVERITY,
      NOTIFICATIONS.UPDATE_FAVOURITES_ERROR.MESSAGE,
    ));
  } else if (!isEqual(favourites, json)) {
    dispatch(updateFavourites(json));
    dispatch(addNotification(
      NOTIFICATIONS.UPDATED_FAVOURITES.SEVERITY,
      NOTIFICATIONS.UPDATED_FAVOURITES.MESSAGE,
    ));
  }
};
