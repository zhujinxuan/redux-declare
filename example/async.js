"use strict";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { wrapReducers, wrapActions } from "redux-declare";
import assert from "assert";

let nestedReducers = {
  add: (state, action) => ({
    count: state.count + action.count
  }),
  sub: {
    success: (state, action) => ({
      count: state.count - action.count
    }),
    error: (state, action) => ({
      count: state.count + 0.01
    })
  },
  pause: (state, action) => ({
    paused: action.paused || !state.paused
  })
};

let nestedActions = {
  sub: {
    pending: payload => (dispatch, getState) => {
      setTimeout(() => {
        if (!getState().paused) {
          dispatch({
            status: "success",
            count: payload.count
          });
        } else {
          dispatch({ status: "error" });
        }
      }, payload.delay);
    }
  }
};

// Options default options
let reducer = wrapReducers(nestedReducers);
let actionCreators = wrapActions(nestedReducers, nestedActions);
let store = createStore(
  reducer,
  { count: 0, paused: false },
  applyMiddleware(thunk)
);

let { add, sub, pause } = actionCreators;

// Test Async Actions
store.dispatch(add({ count: 9 }));
assert(store.getState().count === 9);

store.dispatch(sub("success", { count: 9 }));
assert(store.getState().count === 0);

// Test Delayed Actions
store.dispatch(sub("pending", { count: 9, delay: 1 }));
setTimeout(() => {
  assert(store.getState().count === -9);
}, 10);

setTimeout(() => {
  store.dispatch(pause());
  assert(store.getState().paused === true);
  store.dispatch(sub("pending", { delay: 10 }));
  setTimeout(() => {
    assert(store.getState().count === -8.99);
  }, 100);
}, 100);
