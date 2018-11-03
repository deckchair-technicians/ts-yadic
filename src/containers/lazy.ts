import {addGetter, lazy, replaceGetter} from "../util/dynamagic";
import {Activators} from "../activators";


export function standalone<T>(activators: Activators<T, {}>): T {
  return dependent(activators, {});
}

export function dependent<T, D>(activators: Activators<T, D>, dependencies: D): T & D {
  const result = <T & D>{};
  const getFromDependencies = (o, k) => addGetter(o, k as keyof T & D, () => dependencies[k]);

  Object
    .keys(dependencies)
    .reduce(getFromDependencies, result);

  const activate = (o, k) => activators[k](o);
  const decorate = (o, k) => {
    return activators[k](replaceGetter(o, k, () => dependencies && dependencies[k]));
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

