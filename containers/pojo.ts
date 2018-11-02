import {MissingKeyFn} from "../activators";
import {GetterMapper, mapGetters} from "../util/dynamagic";

export function recordMissing<T>(missing: Set<keyof T> = new Set<keyof T>()): MissingKeyFn<T> {
  return (k: keyof T) => {
    missing.add(k);
    return undefined;
  }
}

export function container<T>(data: T, missing: MissingKeyFn<T> = (k) => {
  throw new Error(`'${k}' was undefined`)
}): T {
  const mapper: GetterMapper<T, T> = <K extends keyof T>(i: T, k: K): (() => T[K]) => {
    return () => {
      const value = data[k];
      return value !== undefined ? value : missing(k);
    }
  };

  return mapGetters(data, mapper);
}