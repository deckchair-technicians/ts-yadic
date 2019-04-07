import chai, {expect} from "chai";
import chaiAsPromised from 'chai-as-promised';
import {lazy} from "../../index";

chai.use(chaiAsPromised);

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

  it("Appends path through container to error messages from promises", async () => {
    type Thing = {
      a: Promise<string>;
      b: Promise<string>;
      c: Promise<string>;
      d: Promise<string>;
    }

    let activators = {
      a: async (thing: Thing) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        return thing.c
      },
      b: async (thing: Thing) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        return thing.c
      },
      c: async (thing: Thing) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        return thing.d
      },
      d: async (_: Thing) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        throw new Error("Oops")
      }
    };
    const one = lazy<Thing>(activators);
    const two = lazy<Thing>(activators);

    return Promise.all([
      expect(one.a).rejectedWith("a > c > d: Oops"),
      expect(two.a).rejectedWith("a > c > d: Oops"),
      expect(one.b).rejectedWith("b > c > d: Oops"),
      expect(two.b).rejectedWith("b > c > d: Oops")
    ]);
  });

  it("Returns result from promises", async () => {
    type Thing = {
      a: Promise<string>;
      b: Promise<string>;
      c: Promise<string>;
    }
    const c = lazy<Thing>({
      a: async (thing: Thing) => thing.b,
      b: async (thing: Thing) => thing.c,
      c: async (_: Thing) => 'c'
    });

    expect(c.a).eventually.eq("c");
  });
});