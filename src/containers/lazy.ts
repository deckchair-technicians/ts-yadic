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
            if (!isPromise(result))
              return result;

            return result.catch(e => {
              throw addPath(e)
            }) as any;
          } catch (e) {
            throw addPath(e);
          } finally {
            keyStack.pop();
          }
        };
        return addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}