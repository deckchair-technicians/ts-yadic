import {lazyGetter, mapGetters} from "../util/magic";
import {Activators} from "./index";

export function pojo<T>(data: T): Activators<T> {
  return mapGetters(data, <K extends keyof T>(original, result, k) => () => lazyGetter(result, k, (container) => data[k]));
}
