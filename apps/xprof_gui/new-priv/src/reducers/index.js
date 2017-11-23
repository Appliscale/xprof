import { combineReducers } from 'redux';
import monitoring from './monitoring';
import navigation from './navigation';
import status from './status';
import tracing from './tracing';

const rootReducer = combineReducers({
  monitoring,
  navigation,
  status,
  tracing,
});

export default rootReducer;
