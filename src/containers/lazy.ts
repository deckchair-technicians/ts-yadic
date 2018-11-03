import {addGetter, lazy} from "../util/dynamagic";
import {Activators} from "../activators";


export function container<T>(activators: Activators<T>): T {
  const result = <T>{};
  Object
    .keys(activators)
    .reduce((o, k) => {
        const getter = () => lazy(o, k as keyof T, activators[k](o));
        return addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}

