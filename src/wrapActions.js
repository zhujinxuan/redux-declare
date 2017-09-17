import preCheck from "./preCheck.js";
import composeAutoFix from "./composeAutoFix.js";

let defaultOptions = { statusKey: "status" };

function wrapActions(nestReducers, nestActions = {}, options = {}) {
  preCheck(nestReducers, "Reducers");
  preCheck(nestActions, "Actions");

  options = Object.assign({}, defaultOptions, options);
  let statusKey = options.statusKey;
  let nestActionsFromReducer = createNestActionsFromReducer(
    nestReducers,
    statusKey
  );

  return mergeActions(nestActionsFromReducer, nestActions);
}

function createNestActionsFromReducer(reducer, statusKey) {
  let nestActionFromReducer = {};
  for (const k of Object.keys(reducer)) {
    nestActionFromReducer[k] = createNestActions(reducer[k], k, statusKey);
  }
  return nestActionFromReducer;
}

function createNestActions(elem, key, statusKey) {
  if (typeof elem === "function") {
    return payload => Object.assign({}, payload, { type: key });
  } else if (typeof elem === "object") {
    let res = {};
    for (const status of Object.keys(elem)) {
      res[status] = payload =>
        Object.assign({}, payload, { type: key, [statusKey]: status });
    }
    return res;
  }
  // Not necessary to throw error;
  // meow~
  return () => undefined;
}

function mergeActions(actionsByReducers, actions) {
  let result = {};
  for (const typeKey of Object.keys(actions)) {
    let actionLeft = actionsByReducers[typeKey];
    let actionRight = actions[typeKey];

    // Merge happens only when customized and reducer-generated actions are
    // objects;  Otherwise, overwritten by action

    if (typeof actionLeft !== "object" || typeof actionRight !== "object") {
      result[typeKey] = actionRight;
    } else {
      // I could write no if-else here, but I do not dare to do that
      result[typeKey] = Object.assign({}, actionLeft, actionRight);
    }
  }

  for (const typeKey of Object.keys(actionsByReducers)) {
    if (!result[typeKey]) {
      result[typeKey] = actionsByReducers[typeKey];
    }
  }
  return translateNestActions(result);
}

function translateNestActions(nestActions) {
  let result = {};
  for (const typeKey of Object.keys(nestActions)) {
    if (typeof nestActions[typeKey] === "object") {
      let nestedElem = Object.assign({}, nestActions[typeKey]);
      result[typeKey] = (status, payload) => {
        let prefix = { status: status, type: typeKey, thunk: true };
        return composeAutoFix(prefix, nestedElem[status])(payload);
      };
      // result[typeKey] = (status, payload) =>  nestedElem[status](payload);
    } else if (typeof nestActions[typeKey] === "function") {
      let prefix = { type: typeKey };
      result[typeKey] = composeAutoFix(prefix, nestActions[typeKey]);
      // result[typeKey] = nestActions[typeKey]
    } else {
      result[typeKey] = () => undefined;
    }
  }
  return Object.assign({}, result);
}

export default wrapActions;
