import * as magic from "../util/magic";
import {Activators} from "./index";

export function pojo<T>(data: T): Activators<T> {
  return magic.mapGetters(data, <K extends keyof T>(original, result, k) => () => magic.lazyGetter(result, k, (container) => data[k]));
}
