import {pojo, lazy} from "../../index";
import {expect} from 'chai';

describe("activators.pojo", () => {
  it("Returns values from object", () => {
    const data = {a: 1};
    const c = lazy(pojo(data));
    expect(c.a).eq(1);
  });

  it("Is immutable even if underlying data changes", () => {
    const data = {a: 1};
    const c = lazy(pojo(data));

    expect(c.a).eq(1);

    data.a = 2;

    expect(c.a).eq(1);
  })
});