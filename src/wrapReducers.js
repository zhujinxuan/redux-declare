"use strict";

import preCheck from "./preCheck.js";

let defaultOptions = {
  statusKey: "status",
  defaultState: {},
  autoFixState: true
};

function wrapReducers(nestReducers, options = {}) {
  preCheck(nestReducers, "Reducers");
  options = Object.assign({}, defaultOptions, options);
  let flattenReducers = {};

  for (const k of Object.keys(nestReducers)) {
    let elem = nestReducers[k];
    if (typeof nestReducers[k] === "function") {
      flattenReducers[k] = elem;
    } else {
      flattenReducers[k] = flatten(elem, options);
    }
  }

  // For possible fast mode
  flattenReducers = Object.assign({}, flattenReducers);

  return (prevState = options.defaultState, action) => {
    if (flattenReducers[action.type]) {
      let nextState = flattenReducers[action.type](prevState, action);
      return options.autoFixState
        ? Object.assign({}, prevState, nextState)
        : nextState;
    }
    // for combineReducers
    return prevState;
  };
}

function flatten(elem, options) {
  let statusKey = options.statusKey;
  // not throw an error here, however.
  return (prevState, action) => elem[action[statusKey]](prevState, action);
}

export default wrapReducers;
