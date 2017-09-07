# API Reference for `wrapReducers`

* [Methods](#methods)
  * [wrapReducers](#wrapReducers)
  * [wrapActions](/doc/API/wrapActions.md)

## Methods
### wrapReducers

```js
wrapReducers(
  nestedReducers,
  options = defaultOptions
)
```
wrap a reducer from an object with `{action.type: function}` or `{action.type: {action.status: function}}`, therefore renders would render state change 
wisely by the accepted `action.type` and `action.status`.

#### `wrapReducers({type: function})`
`wrapReducer` creates Redux reducer by `action.type`;

##### Example
The following code block
```js
let reducer = wrapReducers({
  add: (state, action) => {count: state.count + action.count},
  sub: (state, action) => {count: state.count - action.count},
  })
```

is an equivalence to

```js 
let reducer = function (state, action) {
  switch(action.type) {
    case 'add':
      return {...state, count: state.count+ action.count};
      break;
    case 'sub':
      return {...state, count: state.count- action.count};
      break;
    default:
      return state;
  }
}
```

#### `wrapRedcers({type: {status: function}})` 
`wrapReducers` creates Redux reducers by `action.type` and by `action.status`, and `wrapReducers` automatically merges reducer rules with and without `action.status`.

##### Example
The following code block 
``` js
let reducer = wrapReducers({
  add: (state, action) => {count: state.count + action.count},
  sub: {
    success: (state, action) => {count: state.count- action.count};
    error: (state, action) => {count: 999}
  }
  })
```
is an equivalence to 
```js
let reducer = function (state, action) {
  switch(action.type) {
    case 'add':
      return {...state, count: state.count+ action.count};
      break;
    case 'sub':
      switch (action.status) {
        case 'success': 
          return {...state, count: state.count - action:count};
        case 'error': 
          return {...state, count: 999};
        default:
          return state;
      }
      break;
    default:
      return state;
  }
}
```

#### `wrapReducers(nestedReducers, options)` 
Some addtional configuration is provided by `options`.  

1.  `options.statusKey`, by default` 'status'`
This option determines where to search the `status` in the dispatched `action`.  
If we set `options.statusKey = 'cat'`, in all example above, the `action.status` will be replaced by `action.cat`.

2. `options.defaultState`, by default `{}`
This option determines the default Redux State set by the reducer;

3. `options.autoFixState`, by default `true`
This options determines whether reducers would add `{...state}` in the state change.  If false, all `...state` in the exmaples above will be deleted.
