export function partition<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  return list.reduce(([pos, neg]: [T[], T[]], ele) => {
    if( pred(ele) ){
      pos.push(ele);
    } else {
      neg.push(ele);
    }
    return [pos, neg];
  }, [[], []]);
}

export function partitionConv<T, U, V>(
  list: T[],
  pred: (t: T) => boolean,
  posConv: (t: T) => U,
  negConv: (t: T) => V
): [U[], V[]] {
  return list.reduce(([pos, neg]: [U[], V[]], ele) => {
    if( pred(ele) ){
      pos.push(posConv(ele));
    } else {
      neg.push(negConv(ele));
    }
    return [pos, neg];
  }, [[], []]);
}
