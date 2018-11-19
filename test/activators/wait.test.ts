import {expect} from "chai";
import {wait, lazy, Activators, rollup} from "../../index";

describe("asynchronous activators", () => {
    it("Activators that return promises work as you'd expect", async () => {
      type A = {
        a: Promise<string>;
      }
      type B = {
        b: Promise<string>;
      }
      // a depends on nothing
      const aActivators: Activators<A> = {
        a: async (_: A) => {
          return "value a"
        }
      };

      // b depends on a
      const bActivators: Activators<B, A> = {
        b: async (container: A) => {
          return "b saw: " + await container.a
        }
      };

      const dependencies: A & B = lazy(rollup(aActivators, bActivators));

      expect(await dependencies.a).eq("value a");
      expect(await dependencies.b).eq("b saw: value a");
    });

    it("wait() can help simplify constructors that take a few dependencies", async () => {
      type A = {
        a: Promise<string>;
        b: Promise<string>;
      }
      type B = {
        c: Promise<string>;
      }
      // a depends on nothing
      const aActivators: Activators<A> = {
        a: async (_: A) => "value a",
        b: async (_: A) => "value b"
      };

      // b depends on a
      const bActivators: Activators<B, A> = {
        c: wait(["a", "b"], (c) => `c saw: ${c.a}, ${c.b}`)
      };

      const dependencies: A & B = lazy(rollup(aActivators, bActivators));

      expect(await dependencies.a).eq("value a");
      expect(await dependencies.b).eq("value b");
      expect(await dependencies.c).eq("c saw: value a, value b");
    });

    it("wait() can wrap asynchronous functions", async () => {
      type A = {
        a: Promise<string>;
        b: Promise<string>;
      }

      // a depends on nothing
      const aActivators: Activators<A> = {
        a: async (_: A) => "value a",
        b: wait(["a"], async (c) => `b saw ${c.a}`)
      };

      const dependencies: A = lazy(aActivators);

      expect(await dependencies.a).eq("value a");
      expect(await dependencies.b).eq("b saw value a");
    });
  }
);
