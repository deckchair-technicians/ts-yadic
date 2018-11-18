import {pluck} from "../util/magic";

export type Resolve<T> = T extends Promise<infer U> ? U : T;
export type Resolved<T> = { [K in keyof T]: Resolve<T[K]> }

export async function resolve<T>(t: T): Promise<Resolved<T>> {
  const result = <Resolved<T>>{};
  for (const k of Object.keys(t)) {
    result[k] = await t[k];
  }
  return result;
}

export function wait<T, K extends keyof T, V>(keys: K[], fn: (c: Resolved<Pick<T, K>>) => V): (container: T) => Promise<Resolve<V>> {
  return async (container: T) : Promise<Resolve<V>> => {
    const plucked = pluck(container, keys);
    const resolved = await resolve(plucked);
    return await fn(resolved) as Resolve<V>;
  }
}
