export type Activator<T, K extends keyof T> = (container: T, k: K) => T[K];
export type Activators<T, DEPENDSON = {}> = { [K in keyof T]: Activator<T & DEPENDSON, K> }