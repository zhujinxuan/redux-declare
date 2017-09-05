import { createStore, applyMiddleware } from "redux";
import { wrapReducers, wrapActions } from "redux-declare";
import assert from "assert";

let nestedReducers = {
  add: (state, action) => ({
    count: state.count + action.count
  }),
  sub: (state, action) => ({
    count: state.count - action.count
  })
};

let reducer = wrapReducers(nestedReducers);
let actionCreators = wrapActions(nestedReducers, {});
let { add, sub } = actionCreators;

let store = createStore(reducer,{ count: 0});

store.dispatch(add({ count: 9 }));
assert(store.getState().count === 9);

store.dispatch(sub( { count: 9 }));
assert(store.getState().count === 0);
