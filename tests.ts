import {expect} from "chai";
import * as lazy from "./containers/lazy";
import * as missing from "./containers/missing";
import {Activators} from "./activators";
import {rollup} from "./containers/lazy";

describe("missing.container", () => {
  it("Just returns values from underlying object", () => {
    const c = missing.container({a: "value"});

    const value = c.a;
    expect(value).eq("value");
  });
  it("Is immutable", () => {
    const c = missing.container({a: "value"});

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });
  it("Calls missing function if value is undefined", () => {
    const c = missing.container({a: undefined}, (t, k) => `MISSING ${k}`);

    const value = c.a;
    expect(value).eq("MISSING a");
  });
  it("Defaults to throwing errors on missing values", () => {
    const c = missing.container({a: undefined});

    expect(() => c.a).throws("'a' was undefined");
  });
});

describe("lazy.container", () => {
  it("Returns values from activator", () => {
    type Thing = {
      a: string;
    }
    const c = lazy.standalone({a: (_: Thing) => "a value"});

    expect(c.a).eq("a value");
  });

  it("Is lazy", () => {
    let called: boolean = false;
    const _ = lazy.standalone({a: () => called = true});

    expect(called).eq(false);
  });

  it("Only calls the activator once, then caches the value", () => {
    const c = lazy.standalone({a: () => Math.random()});

    expect(c.a).eq(c.a);
  });
  it("Is immutable", () => {
    const c = lazy.standalone({a: () => "value"});

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });
  it("Can combine activators that depend on one another", () => {
    type A = {
      a: string;
    }
    type B = {
      b: string;
    }
    type C = {
      c: string;
    }

    // a depends on nothing
    // b depends on a
    // c depends on a and b
    const aActivators: Activators<A> = {
      a: (_: A) => {
        return "value a"
      }
    };
    const bActivators: Activators<B, A> = {
      b: (container: A) => {
        return "b saw: '" + container.a + "'"
      }
    };
    const cActivators: Activators<C, A & B> = {
      c: (container: A & B) => {
        return `c combined a and b: {a: "${container.a}", b: "${container.b}"}`
      }
    };

    const dependencies: C & A & B = rollup(aActivators, bActivators, cActivators);

    expect(dependencies.a).eq("value a");
    expect(dependencies.b).eq("b saw: 'value a'");
    expect(dependencies.c).eq("c combined a and b: {a: \"value a\", b: \"b saw: 'value a'\"}");
  });


});