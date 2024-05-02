export type Assoc<K, V> = [K, V][];
export type Eq<K> = (a: K, b: K) => boolean;

export function assocEmpty<K, V>(): Assoc<K, V> {
  return [];
}

export function assocGet<K, V>(key: K, alist: Assoc<K, V>, eq: Eq<K> = (a, b) => a === b): V | undefined {
  for (const [k, v] of alist) {
    if (eq(k, key)) {
      return v;
    }
  }
  return undefined;
}

export function assocGetOrAppend<K, V>(key: K, alist: Assoc<K, V>, mkDefault: () => V, eq: Eq<K> = (a, b) => a === b): V {
  let v = assocGet(key, alist, eq);
  if (v === undefined) {
    v = mkDefault();
    assocAppend(key, v, alist);
  }
  return v;
}

export function assocAppend<K, V>(key: K, value: V, alist: Assoc<K, V>) {
  alist.push([key, value]);
}

// export function assocGroupBy<K, V, U>(alist: Assoc<K, V>, combine: (a: V, b: V) eq: Eq<K> = (a, b) => a === b): Assoc<K, U> {

// }

export function groupBy<K, T>(getKey: (item: T) => K, items: T[], eq: Eq<K> = (a, b) => a === b): Assoc<K, T[]> {
  const result: Assoc<K, T[]> = assocEmpty();
  items.forEach(item => {
    const k = getKey(item);
    const v = assocGetOrAppend(k, result, () => [], eq);
    v.push(item);
  });
  return result;
}

export function eqArray<T>(a: T[], b: T[]): boolean {
  if( a.length === b.length ){
    for(let i=0;i<a.length;i++){
      if( a[i] !== b[i] ){
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
