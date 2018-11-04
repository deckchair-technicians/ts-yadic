import {expect} from "chai";
import {lazy, missing, pojo} from "../../index";

describe("missing", () => {
  it("Just returns values from underlying object", () => {
    const c = lazy(missing({a: () => "value"}));

    const value = c.a;
    expect(value).eq("value");
  });
  it("Is immutable", () => {
    const c = lazy(missing({a: () => "value"}));

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });
  it("Calls missing function if value is undefined", () => {
    const c = lazy(missing({a: (o)=>undefined as any}, (t, k) => `MISSING ${k}`));

    const value = c.a;
    expect(value).eq("MISSING a");
  });
  it("Defaults to throwing errors on missing values", () => {
    const c = lazy(missing({a: (o)=>undefined as any}));

    expect(() => c.a).throws("'a' was undefined");
  });
});