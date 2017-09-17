# Write More Organizable Actions and Reducers with Less Code

This package `redux-declare` allows you to create Actions and Reducers with objects like
`{type: function}` and `{type: {status: function}}`.

# Feature

1.  Promise-like Async Actions: Dispatch Async Actions with Status Change.
2.  Declarative Reducers and Actions: As easy as Redux-act/Redux-actions for Synchronic operations.
3.  Neater thunk code: Do not need to rewrite `type` and `status` in thunk code.

# Install 

Just like other packages by npm:

```bash
npm i --save redux-declare
```

# Document
* [Motivation](https://zhujinxuan.github.io/redux-declare/doc/Motivation.html)
* [Methods](https://zhujinxuan.github.io/redux-declare/doc/API/)
  * [`wrapReducers`](https://zhujinxuan.github.io/redux-declare/doc/API/wrapReducers.html)
  * [`wrapActions`](https://zhujinxuan.github.io/redux-declare/doc/API/wrapActions.html)

# A Sync Counter Example

Following is an redux store reprsenting a counter with sync actions (sub
and add).

```javascript
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

store.dispatch(add({ count: 9 }));
assert(store.getState().count === 9);

store.dispatch(sub( { count: 9 }));
assert(store.getState().count === 0);
```

# An Async Counter Example

Following we create a redux store representing a counter with async actions. In
this counter, `add` action is always synchronic. `sub` action is synchronic
when `action.status !== success` , and is asynchronous when `action.status ===
success`.

```javascript
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { wrapReducers, wrapActions } from "redux-declare";
import assert from "assert";

let nestedReducers = {
  add: (state, action) => ({
    count: state.count + action.count
  }),
  sub: {
    // Activated when sub action is pending and state.paused is true
    success: (state, action) => ({
      count: state.count - action.count
    }),
    // Activated when sub action is pending and state.paused is true
    error: (state, action) => ({
      count: state.count + 0.01
    })
  },
  // state.paused controls whether sub async action 
  // would render a success result or an error result
  pause: (state, action) => ({
    paused: action.paused || !state.paused
  })
};

let nestedActions = {
  sub: {
    pending: payload => (dispatch, getState) => {
      setTimeout(() => {
      // If state.paused is false, async dispatch sub action with success
      // status; otherwise, async dispatch sub action with error status.
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
let store = createStore(
  reducer,
  { count: 0, paused: false },
  applyMiddleware(thunk)
);
```

Then we could examine the synchronic and asynchronous actions and
reducers by the code below

```javascript

let actionCreators = wrapActions(nestedReducers, nestedActions);
let { add, sub, pause } = actionCreators;

// Test Sync Actions
store.dispatch(add({ count: 9 }));
assert(store.getState().count === 9);

store.dispatch(sub("success", { count: 9 }));
assert(store.getState().count === 0);

// Test Async Actions
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
```

# FAQ:
 * Do I need to rewrite `type` or `status` when customizing action creators?

   No.  As long as you are trying to dispatching the `type` and `status` by
   the node indexed by the same `type` and `status`, you need not to retype 
   the `type` and `status`.  Even you are dispatch action in thunk, it is 
   not necessary to rewrite the `type` and `status`.  
   Details could be seen in `src/composeAutoFix.js`.

# Maybe In the Plan:

-   [ ] Webpack bundle compile
-   [X] Compose Dispatch for avoid retype action.type
-   [ ] Support FSA by appending rules
-   [ ] `BindAll` like in the \`redux-act\`

