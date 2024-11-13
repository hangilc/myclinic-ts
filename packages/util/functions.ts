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

export function assocSet<K, V>(key: K, value: V, alist: Assoc<K, V>, eq: Eq<K> = (a, b) => a === b) {
  const i = alist.findIndex(([k]) => eq(k, key));
  if( i >= 0 ){
    alist.splice(i, 1, [key, value]);
  } else {
    alist.push([key, value]);
  }
}

export function groupBy<K, T>(getKey: (item: T) => K, items: T[], eq: Eq<K> = (a, b) => a === b): Assoc<K, T[]> {
  function add(acc: T[], ele: T): T[] {
    acc.push(ele);
    return acc;
  }
  return groupByGeneric<K, T, T[]>(getKey, items, eq, () => [], add);
}

export function groupByGeneric<K, T, U>(getKey: (item: T) => K, items: T[],
  eq: Eq<K>, empty: () => U, add: (acc: U, item: T) => U): Assoc<K, U> {
    const result: Assoc<K, U> = [];
    items.forEach(item => {
      const k = getKey(item);
      let u = assocGet(k, result, eq);
      if( u === undefined ){
        u = empty();
      }
      u = add(u, item);
      assocSet(k, u, result, eq);
    })
    return result;
}

export function eqArray<T>(a: T[], b: T[]): boolean {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  const n = Math.min(a.length, b.length);
  const result: [T, U][] = [];
  for(let i=0;i<n;i++){
    result.push([a[i], b[i]]);
  }
  return result;
}