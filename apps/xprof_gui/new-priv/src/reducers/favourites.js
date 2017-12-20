import * as types from '../constants/ActionTypes';

const initialState = {
  favourites: {},
};

const favourites = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_FAVOURITES:
      return {
        ...state,
        favourites: action.favourites,
      };
    case types.SET_FAVOURITES_ENABLED:
      return {
        ...state,
        favouritesEnabled: action.favouritesEnabled,
      };
    default:
      return state;
  }
};

export default favourites;
