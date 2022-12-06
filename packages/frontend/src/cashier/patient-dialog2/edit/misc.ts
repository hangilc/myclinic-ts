import type { Hoken } from "../hoken";

export function resolveTitle(hoken: Hoken | undefined, ifUndefined: string): string {
  if( hoken ){
    if( hoken.hokenId === 0 ){
      return `新規${hoken.name}`;
    } else {
      return `${hoken.name}編集`;
    }
  } else {
    return `新規${ifUndefined}`;
  }
}