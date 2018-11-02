import {expect} from "chai";
import {Activators} from "./activators";
import {intersect} from "./util/dynamagic";
import * as lazy from "./containers/lazy";
import * as pojo from "./containers/pojo";

describe("pojo.container", () => {
  it("Just returns values from underlying object", () => {
    const c = pojo.container({a: "value"});

    const value = c.a;
    expect(value).eq("value");
  });
  it("Is immutable", () => {
    const c = pojo.container({a: "value"});

    expect(() => c.a = "TEST").throws(/Cannot set property/);
  });
  it("Throws an error if values are undefined", () => {
    const c = pojo.container({a: undefined});

    expect(() => c.a).throws("'a' was undefined");
  });
  it("Calls missing function if value is undefined", () => {
    const c = pojo.container({a: undefined}, (k) => `MISSING ${k}`);

    const value = c.a;
    expect(value).eq("MISSING a");
  })
});

describe("lazy.container", () => {
  it("Returns values from activator", () => {
    type Thing = {
      a: string;
    }
    const c = lazy.container<Thing>({a: (thing: Thing) => "a value"});

    expect(c.a).eq("a value");
  });

  it("Only calls the activator once, then caches the value", () => {
    type Thing = {
      a: number;
    }
    const c = lazy.container<Thing>({a: (thing: Thing) => Math.random()});

    expect(c.a).eq(c.a);
  });
  it("Is immutable", () => {
    const c = lazy.container({a: () => "value"});

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
      a: (container: A) => {
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

    type Dependencies = A & B & C;
    const merged: Activators<Dependencies> = intersect(aActivators, bActivators, cActivators);

    const dependencies = lazy.container<Dependencies>(merged);

    expect(dependencies.a).eq("value a");
    expect(dependencies.b).eq("b saw: 'value a'");
    expect(dependencies.c).eq("c combined a and b: {a: \"value a\", b: \"b saw: 'value a'\"}");
  });
});