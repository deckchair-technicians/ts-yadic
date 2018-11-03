import {addGetter, lazy, replaceGetter} from "../util/dynamagic";
import {Activators} from "../activators";


/**
 * Returns an object that lazily calls activators for key values, then caches the result.
 */
export function container<T, D>(activators: Activators<T, D>, dependencies?: D): T & D {
  const result = <T & D>{};
  if(dependencies){
    const getFromDependencies = (o, k) => addGetter(o, k as keyof T & D, () => dependencies[k]);

    Object
      .keys(dependencies)
      .reduce(getFromDependencies, result);
  }

  const activate = (o, k) => activators[k](o);
  const decorate = (o, k) => {
    return activators[k](replaceGetter(o, k, () => dependencies[k]));
  };

  const decorateOrActivate = (o, k) => {
    const activator = o.hasOwnProperty(k) ? decorate : activate;
    return addGetter(o, k as keyof T & D,
      () => lazy(o, k as keyof T & D, activator(o, k)))
  };
  Object
    .keys(activators)
    .reduce(decorateOrActivate, result);

  return result;
}

