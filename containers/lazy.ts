import {addGetter, replaceGetter} from "../util/dynamagic";
import {Activators} from "../activators";

export function replace<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T {
  return Object.defineProperty(object, key, {value});
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
 */
export function lazy<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T[K] {
  return replace(object, key, value)[key];
}


/**
 * Returns an object that lazily calls activators for key values, then caches the result.
 */
export function standalone<T>(activators: Activators<T, {}>): T {
  return dependent(activators, {});
}

/**
 * Returns an object that lazily calls activators for key values, then caches the result.
 */
export function dependent<T, D>(activators: Activators<T, D>, dependencies: D): T & D {
  const result = <T & D>{};
  const getFromDependencies = (o, k) => addGetter(o, k as keyof T & D, () => dependencies[k]);

  Object
    .keys(dependencies)
    .reduce(getFromDependencies, result);

  const activate = (o, k) => activators[k](o);
  const decorate = (o, k) => {
    return activators[k](replaceGetter(o, k, () => dependencies[k]));
  };

  const decorateOrActivate = (o, k) => {
    const wat = o.hasOwnProperty(k) ? decorate : activate;
    return addGetter(o, k as keyof T & D,
      () => lazy(o, k as keyof T & D, wat(o, k)))
  };
  Object
    .keys(activators)
    .reduce(decorateOrActivate, result);

  return result;
}

export function rollup<A, B>
(a: Activators<A>, b: Activators<B, A>)
  : A & B;

export function rollup<A, B, C>
(a: Activators<A>, b: Activators<B, A>, c: Activators<C, A & B>)
  : A & B & C;

export function rollup<A, B, C, D>
(a: Activators<A>, b: Activators<B, A>, c: Activators<C, A & B>, d: Activators<D, A & B & C>)
  : A & B & C & D;

export function rollup<A, B, C, D, E>
(a: Activators<A>, b: Activators<B, A>, c: Activators<C, A & B>, d: Activators<D, A & B & C>, e: Activators<E, A & B & C & D>)
  : A & B & C & D & E;

export function rollup<A, B, C, D, E, F>
(a: Activators<A>, b: Activators<B, A>, c: Activators<C, A & B>, d: Activators<D, A & B & C>,
 e: Activators<E, A & B & C & D>, f: Activators<F, A & B & C & D & E>)
  : A & B & C & D & E & F;

export function rollup(...activators: Activators<any, any>[]) {
  return activators.reduce((result, activators) => dependent(activators, result), {});
}