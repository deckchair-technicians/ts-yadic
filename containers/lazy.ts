import {mapGetters} from "../util/dynamagic";
import {Activators, MissingKeyFn} from "../activators";

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
export function container<T>(activators: Activators<T>, missing?: MissingKeyFn<T>): T {
  function keyGetter<K extends keyof T>(instance: T, key: K): () => T[K] {
    return () => lazy(instance, key, activators[key](instance))  }

  const descriptor = {configurable: true}; // Needs to be configurable so that lazy can call replace
  return mapGetters(activators, keyGetter, descriptor);
}
