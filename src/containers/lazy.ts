import {Activators} from "../activators";
import {addGetter, lazyGetter} from "../util/magic";


export function lazy<T>(activators: Activators<T>): T {
  const result = <T>{};
  const keyStack: string[] = [];
  Object
    .keys(activators)
    .reduce((o, k) => {
        const getter = () => {
          try {
            keyStack.push(k);
            return lazyGetter(o, k as keyof T, activators[k](o, k));
          } catch (e) {
            if(!e.sourceActivatorPath){
              e.sourceActivatorPath = keyStack;
              e.message = `${keyStack.join(" > ")}: ${e.message}`;
            }
            throw e;
          } finally {
            keyStack.pop();
          }
        };
        return addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}