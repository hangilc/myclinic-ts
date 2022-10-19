export function partition<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  return list.reduce(([pos, neg], ele) => {
    if( pred(ele) ){
      pos.push(ele);
    } else {
      neg.push(ele);
    }
    return [pos, neg];
  }, [[], []]);
}
