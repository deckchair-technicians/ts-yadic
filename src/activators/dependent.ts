import {addGetter, lazyGetter, mapGetters} from "../util/magic";
import {Activator} from "./types";
import {Activators} from "./types";

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

export function dependent<T, D extends DS, DS>(activators: Activators<T, D>, dependencies: Activators<DS>): Activators<T & DS> {
  const result = <Activators<T & DS>>{};
  const getFromDependencies = (reduced, k) => addGetter(reduced, k as keyof T & D, () => dependencies[k]);

  Object
    .keys(dependencies)
    .reduce(getFromDependencies, result);

  const decorateOrActivate = <K extends keyof T & DS>(reduced: Activators<T & DS>, k: K): Activators<T & DS> => {
    const newActivator: Activator<T & DS, K> = activators[k] as any;
    if (k in reduced) // decorate
    {
      const old = reduced[k];
      return addGetter(reduced, k, () => decoratingActivator<T & DS, K>(k, old, newActivator));
    }

    return addGetter(reduced, k, () => newActivator as Activator<T & DS, K>)
  };

  return Object
    .keys(activators)
    .map(k => k as keyof T & DS)
    .reduce(decorateOrActivate, result);
}


export function rollup<A, B>
(a: Activators<A, A & B>,
 b: Activators<B, A & B>)
  : Activators<A & B>;

export function rollup<A, B, C>
(a: Activators<A, A & B & C>,
 b: Activators<B, A & B & C>,
 c: Activators<C, A & B & C>)
  : Activators<A & B & C>;

export function rollup<A, B, C, D>
(a: Activators<A, B & C & D>,
 b: Activators<B, A & C & D>,
 c: Activators<C, A & B & D>,
 d: Activators<D, A & B & C>)
  : Activators<A & B & C & D>;

export function rollup<A, B, C, D, E>
(a: Activators<A, A & B & C & D & E>,
 b: Activators<B, A & B & C & D & E>,
 c: Activators<C, A & B & C & D & E>,
 d: Activators<D, A & B & C & D & E>,
 e: Activators<E, A & B & C & D & E>)
  : Activators<A & B & C & D & E>;

export function rollup<A, B, C, D, E, F>
(a: Activators<A, A & B & C & D & E & F>,
 b: Activators<B, A & B & C & D & E & F>,
 c: Activators<C, A & B & C & D & E & F>,
 d: Activators<D, A & B & C & D & E & F>,
 e: Activators<E, A & B & C & D & E & F>,
 f: Activators<F, A & B & C & D & E & F>)
  : Activators<A & B & C & D & E & F>;

export function rollup<A, B, C, D, E, F, G>
(a: Activators<A, A & B & C & D & E & F & G>,
 b: Activators<B, A & B & C & D & E & F & G>,
 c: Activators<C, A & B & C & D & E & F & G>,
 d: Activators<D, A & B & C & D & E & F & G>,
 e: Activators<E, A & B & C & D & E & F & G>,
 f: Activators<F, A & B & C & D & E & F & G>,
 g: Activators<G, A & B & C & D & E & F & G>)
  : Activators<A & B & C & D & E & F & G>;

export function rollup(...activators: Activators<any, any>[]) {
  return activators.reduce((result, activators) => dependent(activators, result), {});
}