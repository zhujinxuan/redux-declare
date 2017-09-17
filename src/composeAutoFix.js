function composeAutoFix(prefix, func) {
  // func('status', payload)
  // func(payload)
  return (...args) => {
    if (typeof func !== "function") {
      throw new Error("not a func, but a " + typeof func);
    }
    let result = func(...args);
    if (typeof result === "function") {
      return wrapFunction(prefix, result);
    } else if (Array.isArray(result)) {
      return result;
    } else if (typeof result === "object" && !result.prototype) {
      return wrapObject(prefix, result);
    }
    return result;
  };
}

function wrapObject(prefix, result) {
  let { type, status } = prefix;
  return Object.assign({ type }, status ? { status } : {}, result);
}

function wrapFunction(prefix, thunk) {
  // thunk(dispatch, getState) => dispatch(func) or dispatch(Object)
  if (!prefix.thunk) {
    return thunk;
  }
  return (dispatch, getState) =>
    thunk(wrapDispatch(prefix, dispatch), getState);
}

function wrapDispatch(prefix, dispatch) {
  if (!prefix.thunk) {
    return dispatch;
  }
  return action => {
    if (typeof action === "function") {
      return dispatch(wrapFunction(prefix, action));
    } else if (typeof action === "object" && !action.prototype) {
      return dispatch(wrapObject(prefix, action));
    }
    return dispatch(action);
  };
}

export default composeAutoFix;
