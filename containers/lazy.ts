import {addGetter} from "../util/dynamagic";
import {Activators} from "../activators/index";

export function replace<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T {
  return Object.defineProperty(object, key, {value});
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
 */
export function lazy<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T[K] {
  return replace(object, key, value)[key];
}

function addActivatorGetters<T>(activators: Activators<T, any>, result): T {
  Object
    .keys(activators)
    .reduce((o, k) => addGetter(o, k as keyof T, () => lazy(o, k as keyof T, activators[k](o)), {configurable: true}), result);
  return result;
}

/**
 * Returns an object that lazily calls activators for key values, then caches the result.
 */
export function standalone<T>(activators: Activators<T, {}>): T {
  return addActivatorGetters(activators, {});
}

/**
 * Returns an object that lazily calls activators for key values, then caches the result.
 */
export function dependent<T, D>(activators: Activators<T, D>, dependencies: D): T & D {
  const result = addActivatorGetters(activators, {}) as T & D;
  Object
    .keys(dependencies)
    .reduce((o, k) => addGetter(o, k as keyof T & D, () => dependencies[k]), result);
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