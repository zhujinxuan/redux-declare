# API Reference for `wrapActions`

* [Methods](#methods)
  * [wrapReducers](/doc/APU/wrapReducers.md)
  * [wrapActions](#wrapActions)

### wrapActions

```js
wrapActions(
  nestedReducers,
  nestedActions = {},
  options = defaultOptions
)
```
`wrapActions` create a colloction of action creators by the `nestedReducers` and `nestedActions`
* The `nestReducers` is an object accepted by `wrapReducers`, structured like `{action.type: function}` or `{action.type: {action.status: function}}`. 

* The `nestActions` is for users to customize and overwrite their own actionCreators, structured like `{action.type: function}` or `{action.type: {action.status: function}}`. 

### wrapActions(nestedReducers)
It automatically generates action creators by the `action.type` and `action.status` already existed in the `nestedReducers`

The code below
#### Example
```js
let actionCreators = wrapActions(
  add: AnyFunctionYouLikeA;
  sub: {
    success: AnyFunctionYouLikeB,
    error: AnyFunctionYouLikeC
  }
)
```
is an equivalence to 

```js
actionCreators = {
  add: (payload) => {...payload, type:'add'},
  sub: (status, payload) => {...payload, type:'sub', status:status}
}
```

### wrapActions(nestedReducers, nestedActions) 
It would automatically generate action creators by `action.type` and `action.status` first, and try to merge it with the action creators by `nestedActions`.

#### An Example of Async Counter

```js
let nestedReducers = {
  add: AnyFunctionYouLikeA;
  sub: {
    success: AnyFunctionYouLikeB,
  }
}
let nestedActions = {
  sub: {
    pending: payload => dispatch => {
      setTimeout(() => {
          dispatch({type:'sub', status:'success', count: payload.count})
          }, payload.delay)
    }
  }
}
```
is an equivalence to
```js
let actionCreators = {
  add: payload => {type: 'add', count: payload.count},
  sub: (status, payload) => {
    switch (status) {
      case 'pending':
        return dispatch => {
          setTimeout(() => {
              dispatch({type:'sub', status:'success', count: payload.count})
            }, payload.delay)
        }
        break;
      case 'success':
        return {type: 'sub', status:'instant', count: payload.count};
        break;
      default:
        throw new Error('XXX is not a function');
    }
  }
}
```

#### An Example when nestedReducers is absent; all action creators customized by users
```js
let actionCreators = wrapActions({}, {
  add: payload => {type: 'add', count: payload.count},
  sub: {
    pending: payload => {type: 'sub', status:'pending', count: payload.count, delay: payload.delay},
    instant: payload => {type: 'sub', status:'instant', count: payload.count},
  }
  })
```
is an equivalence to
```js
let actionCreators = {
  add: payload => {type: 'add', count: payload.count},
  sub: (status, payload) => {
    switch (status) {
      case 'pending':
        return {type: 'sub', status:'pending', count: payload.count, delay: payload.delay};
        break;
      case 'instant':
        return {type: 'sub', status:'instant', count: payload.count};
        break;
      default:
        throw new Error('XXX is not a function');
    }
  }
}
```


#### Rules of merging 

In the `wrapActions`, we would try to translate `nestedReducers` and `nestedActions` into an representation of action creators as `{type: {status:actionCreator}}` and 
`{type: actionCreators}`(when `status` is absent).  For any `type` existed in `nestedReducers` or in `nestedActions`, 
  1. If `nestedAction[type]` is object (with status), and `nestedReducers[type]` is undefined or not an object, then the action creator is overwritten by `nestedActions`.
  2. If `nestedAction[type]` is absent, action creators are overwritten by `nestedReducers`.
  3. If `nestedAction[type]` is a function instead of an object, action creators are overwritten by `nestedAction[type]` 
  4. If `nestedAction[type]` is valid, `nestedReducers[type]` is a function, action creators are overwritten by `nestedActions[type]`

Simply speaking, the merge happens only when both `nestedAction[type]` and `nestedReducers[type]` are valid objects.  Otherwise, the action creator is determined by 
`nestedActions[type]` if valid, and if `nestedActions[type]` is undefined, then it is determined by `nestedAction[type]`.

##### Example of Merge: type exist in either of nestedReducers and nestedActions, but not in the other
```js
let nestedReducers = {
  add: AnyFunction1,
};
let nestedActions = {
  sub: YourFunctionOfSub,
}
let actionCreators = wrapActions(nestedReducers, nestedActions)
```
is an equivalence to

```js 
let actionCreators = {
  add: (payload) => {...payload, type:'add'},
  sub: YourFunctionOfSub
}
```

##### Example of Merge: type exist in both nestedReducers and nestedActions; 
```js
let nestedReducers = {
  add: AnyFunction1,
  sub: {
    success: AnyFunction2,
    error: AnyFunction3,
    instant: AnyFunction4,
  }
};
let nestedActions = {
  add: YourFunctionOfAdd,
  sub: {
    pending:YourFunctionOfPending,
    instant:YourFunctionOfInstant
  },
}
let actionCreators = wrapActions(nestedReducers, nestedActions)
```
is an equivalence to

```js 
let actionCreators = {
  add: YourFunctionOfAdd,
  sub: (status, payload) => {
    switch (status) {
      case 'pending': 
        return YourFunctionOfPending(payload);
        break;
      case 'instant':
        return YourFunctionOfInstant(payload);
        break;
      case 'success':
        return {...payload, type:'sub', status: 'success'};
        break;
      case 'error':
        return {...payload, type:'sub', status: 'error'};
        break;
      default:
        throw new Error('XXX is not a function');
    }
  }
}
```

##### Example of Merge: add user customized 

```js
let nestedReducers = {
  add: AnyFunction1,
  sub: {}
};
let nestedActions = {
  add2: YourFunctionOfAdd2,
  sub: {
    pending:YourFunctionOfPending,
    instant:YourFunctionOfInstant
  },
  poi: {
    pending: YourFunctionOfPOI
       }
}
let actionCreators = wrapActions(nestedReducers, nestedActions)
```
is an equivalence to

```js 
let actionCreators = {
  add: (payload) => {...payload, type:'add'},
  add2: YourFunctionOfAdd2,
  sub: (status, payload) => {
    switch (status) {
      case 'pending': 
        return YourFunctionOfPending(payload);
        break;
      case 'instant':
        return YourFunctionOfInstant(payload);
        break;
      default:
        throw new Error('XXX is not a function');
    }
  },
  poi: (status, payload) => {
    switch (status) {
      case 'pending':
        return YourFunctionOfPOI(payload);
        break;
    default:
        throw new Error('XXX is not a function')
    }
  }
}
```

### On the Plan, not yet availale:
- [ ] compose dispatch to avoid retype `{type:type}` in user customizing.
- [ ] option to enable FSA
