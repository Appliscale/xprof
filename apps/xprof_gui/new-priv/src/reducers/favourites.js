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
    default:
      return state;
  }
};

export default favourites;
