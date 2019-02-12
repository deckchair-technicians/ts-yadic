import {Activators} from "../activators";
import {lazy} from "./lazy";


export function eager<T>(activators: Activators<T>): T {
  const result = lazy(activators);
  Object
    .keys(result)
    .forEach((k) => {
      result[k];
    });
  return result;
}