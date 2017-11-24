import { combineReducers } from 'redux';
import monitoring from './monitoring';
import navigation from './navigation';
import status from './status';
import favourites from './favourites';
import tracing from './tracing';

const rootReducer = combineReducers({
  monitoring,
  navigation,
  status,
  favourites,
  tracing,
});

export default rootReducer;
