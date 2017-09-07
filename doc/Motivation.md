#  Motivation

`redux-action` and `redux-act` resolves the headache in reading and writing boilerpolate
for sync actions and reducers in Redux, but with async actions, they are not very convenient.
I think the problem is that the `redux-action` and `redux-act` by themselves did not provide
state and state change, from `pending` to `success` for example.  With a nested
object declaration, this package provides you to customize your action creators and
reducers compatible with `[action.status]`.

## Pesudo code about difference with redux-action

In redux-action, you may write something alike (without promise or Observable)

```js
let somethingObj = {
  fetchPending: function,
  fetchSuccess: function,
  fetchError: function
}
```

In this package, you could do something alike

```js
let somethingObj = {
  fetch: {
    pending: function,
    success: function,
    error: function,
   }
}
```

You could see how to use this package in [API reference](doc/API/README.md).
