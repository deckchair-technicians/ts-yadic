import {GetterMapper, mapGetters} from "../util/dynamagic";

export function record<T>(missing: Set<keyof T> = new Set<keyof T>()): MissingKeyFn<T> {
  return (c: T, k: keyof T) => {
    missing.add(k);
    return undefined;
  }
}

export type MissingKeyFn<T> = <K extends keyof T>(t: T, k: K) => T[K]

export function error<T, K extends keyof T>(t: T, k: K): T[K] {
  throw new Error(`'${k}' was undefined in ${Object.keys(t)}`)
}

export function container<T>(data: T, missing: MissingKeyFn<T> = error): T {
  const mapper: GetterMapper<T, T> = <K extends keyof T>(i: T, k: K): (() => T[K]) => {
    return () => {
      const value = data[k];
      return value !== undefined ? value : missing(i, k);
    }
  };

  return mapGetters(data, mapper);
}