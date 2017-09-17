"use strict";
import wrapReducers from "./wrapReducers.js";
import wrapActions from "./wrapActions.js";

export default { action: wrapActions, reducer: wrapReducers };
export { wrapReducers, wrapActions };
