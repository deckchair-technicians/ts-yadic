import {expect} from "chai";
import {eager} from "../../index";

describe("containers.eager()", () => {
  it("Returns values from activator", () => {
    type Thing = {
      a: string;
    }
    const c = eager<Thing>({a: (_: Thing) => "a value"});

    expect(c.a).eq("a value");
  });

  it("Is eager", () => {
    let called: boolean = false;
    const _ = eager({a: () => called = true});

    expect(called).eq(true);
  });

  it("Only calls the activator once, then caches the value", () => {
    const c = eager({a: () => Math.random()});

    expect(c.a).eq(c.a);
  });

  it("Is immutable", () => {
    const c = eager({a: () => "value"});

    expect(() => c.a = "TEST").throws(/Cannot assign to read only property/);
  });
});