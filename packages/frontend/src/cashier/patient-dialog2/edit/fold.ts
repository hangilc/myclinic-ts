export default function fold<T, U>(arg: T | undefined, someF: (some: T) => U, noneF: U): U {
  if( typeof arg === "undefined" ){
    return noneF;
  } else {
    return someF(arg);
  }
}
