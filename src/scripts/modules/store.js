import { applyMiddleware, createStore, compose } from 'redux';
// Logger with default options
import rootReducer from './reducer';
import { getTabs } from '../components/browserActions';
import { preferences } from '../defaultPreferences';
import { composeWithDevTools } from 'remote-redux-devtools';
const composeEnhancers = composeWithDevTools({
  name: 'Android app',
  realtime: true,
  hostname: 'localhost',
  port: 1985,
  maxAge: 30,
  actionsBlacklist: ['EFFECT_RESOLVED'],
});
// const composeEnhancers =
//   typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
//     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
//         // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
//       })
//     : compose;

// import thunk from 'redux-thunk';
// import * as asyncInitialState from 'redux-async-initial-state';
const thunk = store => next => action => (typeof action === 'function' ? action(store.dispatch) : next(action));
let middlewares = [
  thunk,
  // logger
];

// const addLoggingToDispatch = store => {
//   const rawDispatch = store.dispatch;
//   if (!console.group) {
//     return rawDispatch;
//   }
//   return action => {
//     console.group(action.type);
//     console.log('%c Prev State: ', 'color:gray', store.getState());
//     console.log('Action: ', action);
//     const returnValue = rawDispatch(action);
//     console.log('next state:', store.getState());
//     console.log(rawDispatch(action));
//     console.groupEnd(action.type);
//     return returnValue;
//   };
// };
const addPromiseSupportToDispatch = store => {
  const next = store.dispatch;
  return action => {
    if (typeof action.then == 'function') {
      return action.then(next);
    }
    return next(action);
  };
};
async function configureStore() {
  let tabs = await getTabs();
  const defaultState = {
    tabs,
    preferences,
  };
  /* eslint-disable no-underscore-dangle */
  const store = createStore(
    rootReducer,
    defaultState,
    composeEnhancers(applyMiddleware(...middlewares)),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  /* eslint-enable */
  // store.dispatch = addLoggingToDispatch(store);
  store.dispatch = addPromiseSupportToDispatch(store);
  return store;
}
export default configureStore;
