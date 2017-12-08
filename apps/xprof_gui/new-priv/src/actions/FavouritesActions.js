import * as types from '../constants/ActionTypes';
import { callApi } from '../utils/ApiUtils';
import {
  ADD_FAVOURITE_FUNCTION_URL,
  REMOVE_FAVOURITE_FUNCTION_URL,
  ALL_FAVOURITE_FUNCTIONS_URL,
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

export const toggleFavourite = (fun, shouldAdd) => async (dispatch) => {
  const updateFunction = shouldAdd ? addToFavourites : removeFromFavourites;
  const favourites = await updateFunction(fun);
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites,
  });
};

export const fetchFavourites = () => async (dispatch) => {
  const { json } = await callApi(ALL_FAVOURITE_FUNCTIONS_URL);
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites: json,
  });
};
