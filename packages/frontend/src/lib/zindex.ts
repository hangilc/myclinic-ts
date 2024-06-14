let stack = [2000];

export function alloc() {
  if( stack.length > 20 ){
    throw new Error("Too many zindex stack");
  }
  const z = stack[0] + 1
  stack.unshift(z);
  // console.log(stack);
  return z;
}

export function release(zIndex: number) {
  const i = stack.indexOf(zIndex);
  if( i >= 0 ) {
    stack.splice(i, 1);
  }
  // console.log(stack);
}
