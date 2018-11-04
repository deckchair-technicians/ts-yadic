export type Activator<T, K extends keyof T> = (container: T) => T[K];
export type Activators<T, DEPENDSON = {}> = { [K in keyof T]: Activator<T & DEPENDSON, K> }

export * from './dependent';
export * from './missing';
export * from './pojo';
export * from "./requires";
