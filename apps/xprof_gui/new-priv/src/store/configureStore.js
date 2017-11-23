import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  // Uncomment for logging
  // const logger = store => next => (action) => {
  //   if (action.type) {
  //     console.group(action.type);
  //     console.info('dispatching', action);
  //     console.log('next state', store.getState());
  //     console.groupEnd(action.type);
  //   }
  //   const result = next(action);
  //   return result;
  // };

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(ReduxThunk),
    // Uncomment for logging
    // applyMiddleware(logger, ReduxThunk),
  );

  return store;
}
