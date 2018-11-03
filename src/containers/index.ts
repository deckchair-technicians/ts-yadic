import {Activators} from "../activators";
import * as l from "./lazy";
import * as m from "./missing";

export const lazy = l.container;
export const missing = m.container;

export type ContainerConstructor = <T, D>(activators: Activators<T, D>, dependencies?: D) => T & D;

export function rollup<A, B>
(_: [Activators<A>,
   Activators<B, A>],
 containerCtor?: ContainerConstructor)
  : A & B;

export function rollup<A, B, C>
(_: [Activators<A>,
   Activators<B, A>,
   Activators<C, A & B>],
 containerCtor?: ContainerConstructor)
  : A & B & C;

export function rollup<A, B, C, D>
(_: [Activators<A>,
   Activators<B, A>,
   Activators<C, A & B>,
   Activators<D, A & B & C>],
 containerCtor?: ContainerConstructor)
  : A & B & C & D;

export function rollup<A, B, C, D, E>
(_: [Activators<A>,
   Activators<B, A>,
   Activators<C, A & B>,
   Activators<D, A & B & C>,
   Activators<E, A & B & C & D>],
 containerCtor?: ContainerConstructor)
  : A & B & C & D & E;

export function rollup<A, B, C, D, E, F>
(_: [Activators<A>,
   Activators<B, A>,
   Activators<C, A & B>,
   Activators<D, A & B & C>,
   Activators<E, A & B & C & D>,
   Activators<F, A & B & C & D & E>],
 containerCtor?: ContainerConstructor)
  : A & B & C & D & E & F;

export function rollup<A, B, C, D, E, F, G>
(_: [Activators<A>,
   Activators<B, A>,
   Activators<C, A & B>,
   Activators<D, A & B & C>,
   Activators<E, A & B & C & D>,
   Activators<F, A & B & C & D & E>,
   Activators<F, A & B & C & D & E & F>],
 containerCtor?: ContainerConstructor)
  : A & B & C & D & E & F & G;

export function rollup(activators: Activators<any, any>[],
                       containerCtor: ContainerConstructor = lazy) {
  return activators.reduce((result, activators) => containerCtor(activators, result), {});
}