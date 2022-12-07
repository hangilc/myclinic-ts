import type { HokenType } from "../hoken";

export function castHokenType<T>(ht: HokenType | undefined): T | undefined {
  if( ht === undefined ){
    return undefined;
  } else {
    return ht as T;
  }
}
