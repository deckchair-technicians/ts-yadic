import {addGetter, lazy, mapGetters} from "../util/dynamagic";

export type Activator<T, K extends keyof T> = (c: T) => T[K];
export type Activators<T, DEPENDSON = {}> = { [K in keyof T]: Activator<T & DEPENDSON, K> }

export * from "./requires";

export function decoratingActivator<T, K extends keyof T>(k: K, old: Activator<T, K>, activator: Activator<T, K>): Activator<T, K> {
  return <T1 extends T>(t: T1) => {
    const fudged: T1 = mapGetters(
      t,
      (t1: T1, k1: keyof T1): any => {
        return k1 as any === k
          ? () => lazy(t1, k1, old(t1) as any)
          : () => t[k1]
      });
    return activator(fudged);
  }
}

export function dependent<T, D>(activators: Activators<T, D>, dependencies: Activators<D>): Activators<T & D> {
  const result = <Activators<T & D>>{};
  const getFromDependencies = (o, k) => addGetter(o, k as keyof T & D, () => dependencies[k]);

  Object
    .keys(dependencies)
    .reduce(getFromDependencies, result);

  const decorateOrActivate = <K extends keyof T & D>(o: Activators<T & D>, k: K): Activators<T & D> => {
    if (k in o) // decorate
    {
      const old = o[k];
      return addGetter(o, k, () => decoratingActivator<T & D, K>(k, old, activators[k]));
    }

    return addGetter(o, k, () => activators[k] as Activator<T & D, K>)
  };

  return Object
    .keys(activators)
    .map(k => k as keyof T & D)
    .reduce(decorateOrActivate, result);
}


export function rollup<A, B>
(a: Activators<A>,
 b: Activators<B, A>)
  : Activators<Activators<A & B>>;

export function rollup<A, B, C>
(a: Activators<A>,
 b: Activators<B, A>,
 c: Activators<C, A & B>)
  : Activators<A & B & C>;

export function rollup<A, B, C, D>
(a: Activators<A>,
 b: Activators<B, A>,
 c: Activators<C, A & B>,
 d: Activators<D, A & B & C>)
  : Activators<A & B & C & D>;

export function rollup<A, B, C, D, E>
(a: Activators<A>,
 b: Activators<B, A>,
 c: Activators<C, A & B>,
 d: Activators<D, A & B & C>,
 e: Activators<E, A & B & C & D>)
  : Activators<A & B & C & D & E>;

export function rollup<A, B, C, D, E, F>
(a: Activators<A>,
 b: Activators<B, A>,
 c: Activators<C, A & B>,
 d: Activators<D, A & B & C>,
 e: Activators<E, A & B & C & D>,
 f: Activators<F, A & B & C & D & E>)
  : Activators<A & B & C & D & E & F>;

export function rollup<A, B, C, D, E, F, G>
(a: Activators<A>,
 b: Activators<B, A>,
 c: Activators<C, A & B>,
 d: Activators<D, A & B & C>,
 e: Activators<E, A & B & C & D>,
 f: Activators<F, A & B & C & D & E>,
 g: Activators<G, A & B & C & D & E & F>)
  : Activators<A & B & C & D & E & F & G>;

export function rollup(...activators: Activators<any, any>[]) {
  return activators.reduce((result, activators) => dependent(activators, result), {});
}