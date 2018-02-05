import { combineReducers } from 'redux';
import monitoring from './monitoring';
import navigation from './navigation';
import status from './status';
import tracing from './tracing';
import explore from './explore';
import layout from './layout';

const rootReducer = combineReducers({
  monitoring,
  navigation,
  status,
  tracing,
  explore,
  layout,
});

export default rootReducer;
