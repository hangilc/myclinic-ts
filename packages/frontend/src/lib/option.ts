export type Option<T> = T | undefined;

export function optionFold<T, U>(opt: Option<T>, f: (arg: T) => U, defaultValue: U): U {
  if( opt === undefined ){
    return defaultValue;
  } else {
    return f(opt);
  }
}

export function optionMap<T, U>(opt: Option<T>, f: (arg: T) => U): U | undefined {
  return optionFold(opt, f, undefined);
}

export function optionForEach<T>(opt: Option<T>, f: (arg: T) => void): void {
  if( opt !== undefined ){
    f(opt);
  }
}

export function mergeOptions<T>(a: Option<T>, b: Option<T>, merge: (a: T, b: T) => T): Option<T> {
  if( a === undefined ){
    return b;
  } else {
    if( b === undefined ){
      return a;
    } else {
      return merge(a, b);
    }
  }
}
