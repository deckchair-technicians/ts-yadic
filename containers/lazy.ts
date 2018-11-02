import {mapGetters} from "../util/dynamagic";
import {Activators, MissingKeyFn} from "../activators";


export function container<T>(activators: Activators<T>, missing?: MissingKeyFn<T>): T {
  const cache = <T>{};

  function keyGetter<K extends keyof T>(instance: T, key: K): () => T[K] {
    return () => {
      if (!cache[key]) {
        const activator = activators[key];
        if (!activator)
          throw new Error(`No activator for '${key}' in ${Object.getOwnPropertyNames(activators)}`);
        // @ts-ignore
        cache[key] = activator(instance as T);
      }
      const value = cache[key];
      if (missing && value === undefined)
        missing(key as keyof T);
      return value;
    }
  }

  return mapGetters(activators, keyGetter);
}
