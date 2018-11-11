import {addGetter, lazyGetter, mapGetters} from "../util/magic";
import {Activator, Activators} from "./index";

function decoratingActivator<T, K extends keyof T>(k: K, oldActivator: Activator<T, K>, activator: Activator<T, K>): Activator<T, K> {
  return (container: T, k: K) => {
    let mapper = (orginal: T, newContainer: T, k1: keyof T): any => {
      return k1 as any === k
        ? () => lazyGetter(newContainer, k1, oldActivator(newContainer, k1 as any) as any)
        : () => container[k1]
    };
    const fudgedContainer: T = mapGetters(container, mapper);
    return activator(fudgedContainer, k);
  }
}

export function dependent<T, D>(activators: Activators<T, D>, dependencies: Activators<D>): Activators<T & D> {
  const result = <Activators<T & D>>{};
  const getFromDependencies = (reduced, k) => addGetter(reduced, k as keyof T & D, () => dependencies[k]);

  Object
    .keys(dependencies)
    .reduce(getFromDependencies, result);

  const decorateOrActivate = <K extends keyof T & D>(reduced: Activators<T & D>, k: K): Activators<T & D> => {
    if (k in reduced) // decorate
    {
      const old = reduced[k];
      return addGetter(reduced, k, () => decoratingActivator<T & D, K>(k, old, activators[k]));
    }

    return addGetter(reduced, k, () => activators[k] as Activator<T & D, K>)
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