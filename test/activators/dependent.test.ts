import {Activators, lazy, rollup} from "../../index";
import {expect} from "chai";

describe("activators.dependent", () => {
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

      const dependencies: C & A & B = lazy(rollup(aActivators, bActivators, cActivators));

      expect(dependencies.a).eq("value a");
      expect(dependencies.b).eq("b saw: value a");
      expect(dependencies.c).eq("c combined a and b- a: value a; b: b saw: value a");
    });

    it("Can combine activators that do not depend on one another", () => {
      type A = {
        a: string;
      }
      type B = {
        b: string;
      }
      type C = {
        c: string;
      }
      type D = {
        d: string;
      }

      // a depends on nothing
      const aActivators: Activators<A> = {
        a: (_: A) => {
          return "value a"
        }
      };

      // b depends on nothing
      const bActivators: Activators<B> = {
        b: (container: B) => {
          return "value b"
        }
      };

      // c depends on a
      const cActivators: Activators<C, A> = {
        c: (container: A) => {
          return `c saw ${container.a}`
        }
      };

      // c depends on b
      const dActivators: Activators<D, B> = {
        d: (container: B) => {
          return `d saw ${container.b}`
        }
      };


      const dependencies: D & C & A & B = lazy(rollup(aActivators, cActivators, bActivators, dActivators));

      expect(dependencies.a).eq("value a");
      expect(dependencies.b).eq("value b");
      expect(dependencies.c).eq("c saw value a");
      expect(dependencies.d).eq("d saw value b");
    });

    it("Supports decoration", () => {
      type A = {
        a: string
      }
      const original: Activators<A> = {a: () => "original"};
      const decorated: Activators<A> = {a: (thing: any) => `decorated ${thing.a}`};

      const c = lazy(rollup(original, decorated));

      expect(c.a).eq("decorated original");
    });

    it("All activators except the decorator see the decorated value", () => {
      type Thing = {
        a: string;
        b: string;
      }
      const original: Activators<Thing> = {
        a: (c: Thing) => "original",
        b: (c: Thing) => `b saw ${c.a}`
      };

      const decorated = {a: (c: Thing) => `decorated ${c.a}`};

      const c = lazy(rollup(original, decorated));

      expect(c.a).eq("decorated original");
      expect(c.b).eq("b saw decorated original");
    });

    it("Decoration is still lazy", () => {
      let originalCallCount = 0;
      let decoratedCallCount = 0;
      const original = {a: () => ++originalCallCount};
      const decorated = {a: (thing: any) => thing.a + ++decoratedCallCount};

      const c = lazy(rollup(original, decorated));

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
        a: (_: A) => {
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

      const dependencies = lazy(rollup(aActivators, aDecorator, bActivators, cActivators));

      expect(dependencies.a).eq("decorated value a");
      expect(dependencies.b).eq("b saw: 'decorated value a'");
      expect(dependencies.c).eq("c combined a and b: {a: \"decorated value a\", b: \"b saw: 'decorated value a'\"}");
    });
  }
);
