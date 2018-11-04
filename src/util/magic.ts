export function addGetter<T, K extends keyof T>(obj: T, k: K, getter: () => T[K]): T {
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get: getter
  });
  return obj;
}

export type GetterMapper<A, B extends { [K in keyof A]: B[K] }> = <K extends keyof A>(original: A, mapped: B, k: K) => () => B[K];

export function mapGetters<A, B extends { [K in keyof A]: B[K] }>(original: A, mapper: GetterMapper<A, B>): B {
  return Object
    .keys(original)
    .reduce((mapped, k) => addGetter(mapped, k as any, mapper(original, mapped, k as keyof A)), <B>{});
}

export function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const k of keys) {
    result[k] = obj[k];
  }
  return result;
}

function replace<T extends {}, K extends keyof T>(obj: T, k: K, value: T[K]): T {
  return Object.defineProperty(obj, k, {value});
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
 */
export function lazyGetter<T extends {}, K extends keyof T>(obj: T, k: K, value: T[K]): T[K] {
  return replace(obj, k, value)[k];
}