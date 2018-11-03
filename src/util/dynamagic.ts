export function addGetter<T, K extends keyof T>(obj: T, key: K, getter: () => T[K]): T {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: getter
  });
  return obj;
}

export type GetterMapper<A, B extends { [K in keyof A]: B[K] }> = <K extends keyof A>(instance: B, k: K) => () => B[K];

export function mapGetters<A, B extends { [K in keyof A]: B[K] }>(from: A, mapper: GetterMapper<A, B>): B {
  return Object
    .keys(from)
    .reduce((o, k) => addGetter(o, k as any, mapper(o, k as keyof A)), <B>{});
}

export function replaceGetter<T, K extends keyof T>(t: T, k: K, getter: () => T[K]): T {
  return Object
    .keys(t)
    .reduce((o, thisKey) => addGetter(o, k as any, thisKey === k ? getter : ()=>t[k]), <T>{});
}


export function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const ret: any = {};
  for (const key of keys) {
    ret[key] = obj[key];
  }
  return ret;
}

function replace<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T {
  return Object.defineProperty(object, key, {value});
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters
 */
export function lazy<T extends {}, K extends keyof T>(object: T, key: K, value: T[K]): T[K] {
  return replace(object, key, value)[key];
}