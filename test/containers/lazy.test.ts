import {expect} from "chai";
import {lazy} from "../../index";

describe("containers.lazy()", () => {
  it("Returns values from activator", () => {
    type Thing = {
      a: string;
    }
    const c = lazy<Thing>({a: (_: Thing) => "a value"});

    expect(c.a).eq("a value");
  });

  it("Is lazy", () => {
    let called: boolean = false;
    const _ = lazy({a: () => called = true});

    expect(called).eq(false);
  });

  it("Only calls the activator once, then caches the value", () => {
    const c = lazy({a: () => Math.random()});

    expect(c.a).eq(c.a);
  });

  it("Is immutable", () => {
    const c = lazy({a: () => "value"});

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });

  it("Appends path through container to error messages", () => {
    type Thing = {
      a: string;
      b: string;
      c: string;
    }
    const c = lazy<Thing>({
      a: (thing: Thing) => thing.b,
      b: (thing: Thing) => thing.c,
      c: (_: Thing) => {
        throw new Error("Oops")
      }
    });

    expect(() => c.a)
      .throws("a > b > c: Oops");
  });
});