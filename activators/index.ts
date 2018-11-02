export type Activator<T, V> = (c: T) => V;
export type Activators<T, DEPENDSON = {}> = { [P in keyof T]: Activator<T & DEPENDSON, T[P]> }
export type MissingKeyFn<T> = <K extends keyof T>(k: K) => T[K];

export * from "./requires";