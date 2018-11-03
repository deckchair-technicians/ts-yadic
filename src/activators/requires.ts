import {pluck} from "../util/dynamagic";

export type RequireFn<T, K extends keyof T, V> = (c: Pick<T, K>) => V;

/**
 * Return a function that plucks keys from its parameter, and passes the resulting
 * object to fn.
 *
 * Returns undefined if any of the keys are undefined.
 *
 * Will attempt to get all keys, rather than short-circuiting on the first undefined property.
 * This is in case it is important that property getters are called (to report that they are undefined, for
 * example.
 */
export function requires<T, K extends keyof T, V>(keys: K[], fn: RequireFn<T, K, V>) {
  return (c: T) => {
    const plucked = pluck(c, keys);
    for (const key in plucked) {
      if (plucked[key] === undefined)
        return undefined;
    }
    return fn(plucked);
  }
}
