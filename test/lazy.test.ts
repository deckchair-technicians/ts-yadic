import {expect} from "chai";
import {Activators, containers} from "../";
const lazy = containers.lazy;
describe("containers.lazy", () => {
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
    const aActivators: Activators<A> = {
      a: (_: A) => {
        return "value a"
      }
    };

    // b depends on a
    const bActivators: Activators<B, A> = {
      b: (container: A) => {
        return "b saw: " + container.a
      }
    };

    // c depends on a and b
    const cActivators: Activators<C, A & B> = {
      c: (container: A & B) => {
        return `c combined a and b- a: ${container.a}; b: ${container.b}`
      }
    };

    const dependencies: C & A & B = containers.rollup([aActivators, bActivators, cActivators], lazy.dependent);

    expect(dependencies.a).eq("value a");
    expect(dependencies.b).eq("b saw: value a");
    expect(dependencies.c).eq("c combined a and b- a: value a; b: b saw: value a");
  });

  it("Supports decoration", () => {
    const original = {a: () => "original"};
    const decorated = {a: (thing:any) => `decorated ${thing.a}`};

    const c = containers.rollup([original, decorated]);

    expect(c.a).eq("decorated original");
  });

  it("Decoration is still lazy", () => {
    let originalCallCount = 0;
    let decoratedCallCount = 0;
    const original = {a: () => ++originalCallCount};
    const decorated = {a: (thing:any) => thing.a + ++decoratedCallCount};

    const c = containers.rollup([original, decorated], lazy.dependent);

    expect(c.a).eq(2);
    expect(c.a).eq(2);
    expect(originalCallCount).eq(1);
    expect(decoratedCallCount).eq(1);
  });

  it("Supports decoration with a long chain", () => {
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
    const aDecorator: Activators<A> = {
      a: (container: A) => {
        return `decorated ${container.a}`
      }
    };
    const bActivators: Activators<B, A> = {
      b: (container: A) => {
        return `b saw: '${container.a}'`
      }
    };
    const cActivators: Activators<C, A & B> = {
      c: (container: A & B) => {
        return `c combined a and b: {a: "${container.a}", b: "${container.b}"}`
      }
    };

    const dependencies = containers.rollup([aActivators, aDecorator, bActivators, cActivators], lazy.dependent);

    expect(dependencies.a).eq("decorated value a");
    expect(dependencies.b).eq("b saw: 'decorated value a'");
    expect(dependencies.c).eq("c combined a and b: {a: \"decorated value a\", b: \"b saw: 'decorated value a'\"}");
  });

});