import * as types from '../constants/ActionTypes';
import { callApi } from '../utils/ApiUtils';
import {
  ADD_FAVOURITE_FUNCTION_URL,
  REMOVE_FAVOURITE_FUNCTION_URL,
  ALL_FAVOURITE_FUNCTIONS_URL,
  FAVOURITES_ENABLED_URL,
} from '../constants/';

async function removeFromFavourites(fun) {
  const { json } =
    await callApi(`${REMOVE_FAVOURITE_FUNCTION_URL}?query=${fun}`);
  return json;
}

async function addToFavourites(fun) {
  const { json } = await callApi(`${ADD_FAVOURITE_FUNCTION_URL}?query=${fun}`);
  return json;
}

async function favouritesEnabled() {
  const { json } = await callApi(FAVOURITES_ENABLED_URL);
  return json.enabled;
}


export const toggleFavourite = (fun, shouldAdd) => async (dispatch) => {
  const updateFunction = shouldAdd ? addToFavourites : removeFromFavourites;
  const favourites = await updateFunction(fun);
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites,
  });
};

export const fetchFavourites = () => async (dispatch) => {
  const enabled = await favouritesEnabled();
  let favourites = [];
  if (enabled) {
    const { json } = await callApi(ALL_FAVOURITE_FUNCTIONS_URL);
    favourites = json;
  }
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites,
  });
  dispatch({
    type: types.SET_FAVOURITES_ENABLED,
    favouritesEnabled: enabled,
  });
};
