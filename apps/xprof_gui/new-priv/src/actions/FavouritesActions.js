import * as types from '../constants/ActionTypes';
/* eslint-disable */
import {
  ADD_FAVOURITE_FUNCTION_URL,
  REMOVE_FAVOURITE_FUNCTION_URL,
  ALL_FAVOURITE_FUNCTIONS_URL,
} from '../constants/';
/* eslint-enable */

// let's mock storing favourites for now
const favs = [
  'test_module:expensive_fun(Int) when Int > 3',
  'test_module:expensive_fun(Blah) when Blah > 4',
];

function removeFromFavourites(fun) {
  return favs.filter(val => val !== fun);
}

function addToFavourites(fun) {
  return [...favs, fun];
}

export const toggleFavourite = (fun, shouldAdd) => (dispatch) => {
  const updateFunction = shouldAdd ? addToFavourites : removeFromFavourites;
  const favourites = updateFunction(fun);
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites,
  });
};

export const fetchFavourites = () => (dispatch) => {
  const favourites = favs;
  dispatch({
    type: types.UPDATE_FAVOURITES,
    favourites,
  });
};
