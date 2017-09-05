const prefix = "Package redux-declarative-reducers says: ";
function preCheck(nestObj, nameReducerOrActions) {
  let name = nameReducerOrActions;
  if (typeof nestObj !== "object") {
    let msg = `${name} can only be decalred as Object `;
    msg = `${prefix}${name} cannot be decalred as ${typeof nestObj};  ${msg}`;
    throw new Error(msg);
  }
  for (const k of Object.keys(nestObj)) {
    let elem = nestObj[k];
    if (typeof elem !== "function") {
      if (typeof elem !== "object") {
        let msg = `${prefix}${name} Element can be only object or function; Broken in [${k}]`;
        throw new Error(msg);
      } else {
        for (const k2 of Object.keys(elem)) {
          let elem2 = elem[k2];
          if (typeof elem2 !== "function") {
            let msg = `${prefix}: [${k}][${k2}] must be function in ${name} declare.`;
          }
        }
      }
    }
  }
  return true;
}

export default preCheck;
