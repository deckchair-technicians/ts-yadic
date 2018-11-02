import {Activators} from "./index";

/**
 * Activators that just returns set values from
 */
export function activators<T>(data: T): Activators<T> {
  const activators: any = {};

  for (const key in Object.getOwnPropertyDescriptors(data)) {
    Object.defineProperty(activators, key, {
      get: () => (ignore:T) => data[key]
    });
  }
  return activators;
}