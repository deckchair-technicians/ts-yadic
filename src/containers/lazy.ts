import {Activators} from "../activators";
import {addGetter, lazyGetter} from "../util/magic";


function isPromise(x: any): x is Promise<any> {
  return typeof x['then'] === 'function' && typeof x['catch'] === 'function';
}

export function lazy<T>(activators: Activators<T>): T {
  const result = <T>{};
  const keyStack: string[] = [];
  Object
    .keys(activators)
    .reduce((o, k) => {
        const getter = () => {
          keyStack.push(k);
          const keyStackSnapshot = Object.assign([], keyStack);

          function addPath(e) {
            if (!e.sourceActivatorPath) {
              e.sourceActivatorPath = keyStackSnapshot;
              e.message = `${keyStackSnapshot.join(" > ")}: ${e.message}`;
            }
            return e;
          }

          try {
            const result = lazyGetter(o, k as keyof T, activators[k](o, k));
            if (!isPromise(result)) {
              keyStack.pop();
              return result;
            }
            return result.then(x => {
              keyStack.pop();
              return x;
            }).catch(e => {
              keyStack.pop();
              throw addPath(e)
            }) as any;
          } catch (e) {
            keyStack.pop();
            throw addPath(e);
          }
        };
        return addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}