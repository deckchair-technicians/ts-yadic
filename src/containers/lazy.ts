import {createNamespace} from "continuation-local-storage";
import {Activators} from "../activators";
import {addGetter, lazyGetter} from "../util/magic";


function isPromise(x: any): x is Promise<any> {
  return typeof x['then'] === 'function' && typeof x['catch'] === 'function';
}

function addPath(k, e, modifyMessage: boolean) {
  const path = [k, ...(e.sourceActivatorPath || [])];
  return Object.assign({},
    e,
    {
      sourceActivatorPath: path,
      message: modifyMessage
        ? `${path.join(" > ")}: ${e.message}`
        : e.message
    });
}

const storage = createNamespace('yadic/lazy');

export function lazy<T>(activators: Activators<T>): T {
  const result = <T>{};
  Object
    .keys(activators)
    .reduce((o, k) => {
        const getter = () => {
          return storage.runAndReturn(() => {
            const existing: ReadonlyArray<string> = storage.get('keys') || [];
            const ks = [...existing, k];
            storage.set('keys', ks);

            try {
              const result = activators[k](o, k);
              return lazyGetter(o, k as keyof T, isPromise(result)
                ? result.catch(e => {
                  throw addPath(k, e, existing.length === 0);
                })
                : result);
            } catch (e) {
              throw addPath(k, e, existing.length === 0);
            }
          });
        };
        return addGetter(o, k as keyof T, getter)
      },
      result);

  return result;
}