// import { createStore, applyMiddleware } from 'redux';
import { createStore } from 'redux';
import rootReducer from '../reducers';
// import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

export default function configureStore(initialState) {
  // return createStore(rootReducer, initialState, applyMiddleware(reduxImmutableStateInvariant()));
  const store = createStore(rootReducer, initialState);

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
