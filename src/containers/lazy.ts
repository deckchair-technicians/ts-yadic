import * as magic from "../util/magic";
import {Activators} from "../activators";


export function lazy<T>(activators: Activators<T>): T {
  const result = <T>{};
  Object
    .keys(activators)
    .reduce((o, k) => {
        const getter = () => magic.lazyGetter(o, k as keyof T, activators[k](o, k));
        return magic.addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}

