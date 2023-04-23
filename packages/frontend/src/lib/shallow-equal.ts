export interface ShallowEqualOpts {
  excludeKeys?: string[]
}

export function shallowEqual(a: any, b: any, opts: ShallowEqualOpts = {}): boolean {
  if( typeof a === "object" && typeof b === "object" ){
    if( a === b ){
      return true;
    }
    let ka = Object.keys(a);
    let kb = Object.keys(b);
    if( opts.excludeKeys ){
      const excludeKeys: string[] = opts.excludeKeys;
      const pred = (k: string) => !excludeKeys.includes(k)
      ka = ka.filter(pred);
      kb = kb.filter(pred);
    }
    if( ka.length !== kb.length ){
      return false;
    }
    for(let i=0;i<ka.length;i++){
      const k = ka[i]
      if( !(k in b) ){
        return false;
      }
      if( a[k] !== b[k] ){
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}
