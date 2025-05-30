export type Caster<T> = (arg: any) => T;

export function castNumber(arg: any): number {
  if (typeof arg === "number") {
    return arg;
  } else {
    throw new Error("Cannot cast to number: " + arg);
  }
}

export function castStringToInt(arg: any): number {
  if (typeof arg === "string") {
    const i = parseInt(arg);
    if (!isNaN(i)) {
      return i;
    }
  }
  throw new Error("Cannot cast to int: " + arg);
}

export function castNumberFromString(arg: any): number {
  if (typeof arg === "string") {
    const n = parseInt(arg);
    if (!isNaN(n)) {
      return n;
    }
  }
  throw new Error("Cannot convert to number: " + arg);
}

export function castString(arg: any): string {
  if (typeof arg === "string") {
    return arg;
  } else {
    throw new Error("Cannot cast to string: " + arg);
  }
}

export function castBoolean(arg: any): boolean {
  if (typeof arg === "boolean") {
    return arg;
  } else {
    throw new Error("Cannot cast to boolean: " + arg);
  }
}

export function castPair<T, U>(
  castT: Caster<T>,
  castU: Caster<U>
): (arg: any) => [T, U] {
  return (arg: any) => [castT(arg[0]), castU(arg[1])];
}

export function castCdr<T>(castT: Caster<T>): (arg: any) => T {
  return (arg: any) => castT(arg[1]);
}

export function castTuple3<A, B, C>(
  castA: Caster<A>,
  castB: Caster<B>,
  castC: Caster<C>
): (arg: any) => [A, B, C] {
  return (arg: any) => [castA(arg[0]), castB(arg[1]), castC(arg[2])];
}

export function castTuple4<A, B, C, D>(
  castA: Caster<A>,
  castB: Caster<B>,
  castC: Caster<C>,
  castD: Caster<D>
): (arg: any) => [A, B, C, D] {
  return (arg: any) => {
    return [
    castA(arg[0]),
    castB(arg[1]),
    castC(arg[2]),
    castD(arg[3]),
  ]};
}

export function castList<T>(cast: Caster<T>): Caster<T[]> {
  return (arg: any) => {
    return arg.map((a: any) => cast(a));
  }
}

export function castListOpt<T>(cast: Caster<T>): Caster<T[]> {
  return (arg: any) => (arg == undefined) ? [] : castList(cast)(arg)
}

type ObjectKey = string | number | symbol;

export function castObject<K extends ObjectKey, V>(
  castKey: Caster<K>,
  castValue: Caster<V>
): (arg: any) => Record<K, V> {
  return (arg: any) => {
    const obj = {} as Record<K, V>;
    for (let k in arg) {
      const key = castKey(k);
      const val = castValue(arg[k]);
      obj[key] = val;
    }
    return obj;
  };
}

export function castOption<T>(cast: Caster<T>): Caster<T | null> {
  return (arg: any) => {
    if (arg == null) {
      return null;
    } else {
      return cast(arg);
    }
  };
}

export function castOptionUndefined<T>(cast: Caster<T>): Caster<T | undefined> {
  return (arg: any) => {
    if( arg == null ){
      return undefined;
    } else {
      return cast(arg);
    }
  }
}

