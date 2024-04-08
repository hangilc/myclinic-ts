import { Koukikourei, Shahokokuho } from "myclinic-model";

export function resolveFutanWari(hoken: Shahokokuho | Koukikourei): number {
  if( hoken instanceof Shahokokuho ){
    return hoken.koureiStore > 0 ? hoken.koureiStore : 3;
  } else {
    return hoken.futanWari;
  }
}
