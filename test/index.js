"use strict";
import assert from "assert";
import { wrapReducers, wrapActions } from "../src/index.js";

let counter = { count: 1 };
let nestedReducers = {
  add: (prevState, action) => ({
    count: prevState.count + action.count
  }),
  sub: {
    success: (prevState, action) => ({
      count: prevState.count - action.count
    }),
    error: (prevState, action) => ({
      count: prevState.count - 0.5
    })
  }
};

describe("Examine wrapReducers(reducers)", function() {
  let reducers = () => undefined;
  it("Build Reducer function from nested object", () => {
    reducers = wrapReducers(nestedReducers);
  });
  it("Counter test, not nested Obj", () => {
    let action = { type: "add", count: 1 };
    let newCounter = reducers(counter, action);
    assert(newCounter.count === 2, "Not Good");
  });

  it("Counter test, not nested Obj", () => {
    let action = { type: "sub", status: "success", count: 1 };
    let newCounter = reducers(counter, action);
    assert(newCounter.count === 0, "Problem in status test of success");
    action = { type: "sub", status: "error", count: 1 };
    newCounter = reducers(counter, action);
    assert(newCounter.count === 0.5, "Problem in status test of error");
  });
});

function shallEqual(action, payload) {
  for (const k of Object.keys(payload)) {
    if (action[k] !== payload[k]) {
      return false;
    }
  }
  return true;
}

let payload = {
  msg: "Cat is Cute",
  msg1: "Ebony"
};

let payloadRecheck = Object.assign({}, payload);

describe("Examine wrapActions(reducers)", () => {
  let actionCreators = {};

  it("build ActionCreators", () => {
    actionCreators = wrapActions(nestedReducers);
    assert(typeof actionCreators === "object");
  });

  it("Test Not Nested", () => {
    let action = actionCreators.add(payload);
    assert(typeof action === "object");
    assert(action.type === "add");
    assert(
      shallEqual(action, payload),
      "the payload successfully transferred to action"
    );
  });

  it("Test Nested", () => {
    let action = actionCreators.sub("error", payload);
    assert(typeof action === "object");
    assert(action.type === "sub");
    assert(action.status === "error");
    assert(shallEqual(action, payload));
  });
  it("Payload unchanged", () => {
    for (const key of Object.keys(payload)) {
      assert(payload[key] === payloadRecheck[key], `error on key ${key}`);
    }
  });
});

describe("Examine wrapActions(reducers, actions)", () => {
  let nestedAction = {
    add2: () => ({
      type: "add"
    }),
    add: payload => ({
      type: "add",
      count: 100 + payload.count
    }),
    sub: {
      pending: payload =>
        Object.assign(
          {
            type: "sub",
            status: "success"
          },
          payload
        )
    }
  };
  let actionCreators = {};

  it("Built Actions", () => {
    actionCreators = wrapActions(nestedReducers, nestedAction);
    assert(typeof actionCreators === "object", "Success");
  });
  it("Test newly added function", () => {
    let action = actionCreators.add2(payload);
    assert(action.type === "add");
  });
  it("Test not overwritten function", () => {
    let action = actionCreators.sub("error", payload);
    assert(shallEqual(action, payload));
    assert(action.type === "sub");
    assert(action.status === "error");
  });

  it("Test overwritten function with type", () => {
    let action = actionCreators.add({ count: 1 });
    assert(action.count === 101);
    assert(action.type === "add");
  });

  it("Test overwritten function with type, status", () => {
    let action = actionCreators.sub("pending", payload);
    assert(action.status === "success");
    assert(action.type === "sub");
    assert(shallEqual(action, payload));
  });
});
