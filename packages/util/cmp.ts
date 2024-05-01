export function cmpNumSeq(a: number[], b: number[]): 0 | 1 | -1 {
  for(let i=0;i<a.length;i++){
    const c = a[i] - b[i];
    if( c !== 0 ){
      return c > 0 ? 1 : -1;
    }
  }
  return sgn(a.length - b.length);
}

export function sgn(n: number): 0 | 1 | -1 {
  if( n === 0 ){
    return 0;
  } else if( n > 0 ){
    return 1;
  } else {
    return -1;
  }
}