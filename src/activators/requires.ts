import {pluck} from "../util/magic";

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
export function requires<T, K extends keyof T, V>(keys: K[], fn: RequireFn<T, K, V>) : (container:T)=>V{
  return (container: T) => {
    const plucked = pluck(container, keys);
    for (const k in plucked) {
      if (plucked[k] === undefined)
        // TODO: there should be no casting here. Need T[k] to extend undefined
        return undefined as any as V;
    }
    return fn(plucked);
  }
}
