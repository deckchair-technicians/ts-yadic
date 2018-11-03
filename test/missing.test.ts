import {expect} from "chai";
import {containers} from "../";

describe("containers.missing", () => {
  it("Just returns values from underlying object", () => {
    const c = containers.missing({a: "value"});

    const value = c.a;
    expect(value).eq("value");
  });
  it("Is immutable", () => {
    const c = containers.missing({a: "value"});

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });
  it("Calls missing function if value is undefined", () => {
    const c = containers.missing({a: undefined}, (t, k) => `MISSING ${k}`);

    const value = c.a;
    expect(value).eq("MISSING a");
  });
  it("Defaults to throwing errors on missing values", () => {
    const c = containers.missing({a: undefined});

    expect(() => c.a).throws("'a' was undefined");
  });
})