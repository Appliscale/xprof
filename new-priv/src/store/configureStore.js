import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import rootReducer from '../reducers';
// import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

export default function configureStore(initialState) {
  // return createStore(rootReducer, initialState,
  // applyMiddleware(reduxImmutableStateInvariant()));
  // const logger = store => next => (action) => {
  //   console.group(action.type);
  //   console.info('dispatching', action);
  //   console.log('next state', store.getState());
  //   console.groupEnd(action.type);

  //   const result = next(action);
  //   return result;
  // };

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(ReduxThunk),
    // applyMiddleware(logger, ReduxThunk),
  );

  return store;
}
