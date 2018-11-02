export function addGetter<T, K extends keyof T>(obj: T, key: K, getter: () => T[K]): void {
  Object.defineProperty(obj, key, {
    enumerable: true,
    get: getter
  });
}

export type GetterMapper<A, B extends { [K in keyof A]: B[K] }> = <K extends keyof A>(instance: B, k: K) => () => B[K];

export function mapGetters<A, B extends { [K in keyof A]: B[K] }>(from: A, mapper: GetterMapper<A, B>): B {
  const to = <B>{};
  for (const key in Object.getOwnPropertyDescriptors(from)) {
    const getter: () => any = mapper(to, key as keyof A);
    addGetter(to, key as any, getter);
  }
  return to;
}

export function intersect<A, B>(a: A, b: B): A & B ;
export function intersect<A, B, C>(a: A, b: B, c: C): A & B & C;
export function intersect<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
export function intersect<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
export function intersect<A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): A & B & C & D & E & F;
export function intersect(...args: any[]): any {
  const result = {};
  return args.reduce((result, thing) => {
    for (const key in Object.getOwnPropertyDescriptors(thing)) {
      if (Object.getOwnPropertyDescriptor(result, key)) {
        throw new Error(`Duplicate key '${key}'`)
      }
      addGetter(result, key, () => {
        return thing[key]
      });
    }
    return result;
  }, result);
}

export function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const ret: any = {};
  for (const key of keys) {
    ret[key] = obj[key];
  }
  return ret;
}
