import {mapGetters} from "../util/magic";
import {Activator, Activators} from "./index";

export function record<T>(missing: Set<keyof T> = new Set<keyof T>()): MissingKeyFn<T> {
  return <K extends keyof T>(container: T, k: K) => {
    missing.add(k);
    return undefined as any as T[K];
  }
}

export type MissingKeyFn<T> = <K extends keyof T>(container: T, k: K) => T[K]

export function missing<T>(activators: Activators<T>, fn: MissingKeyFn<T> = (t, k) => {
  throw new Error(`'${k}' was undefined`)
}): Activators<T> {
  const mapper = <K extends keyof T>(original: Activators<T>, result: Activators<T>, k: K):
    () => Activator<T, K> => {
    const originalActivator = original[k];
    const activator = (container: T) => {
      const value = originalActivator(container, k);
      return value !== undefined ? value : fn(container, k);
    };
    return () => activator;
  };
  return mapGetters<Activators<T>, Activators<T>>(activators, mapper);
}
