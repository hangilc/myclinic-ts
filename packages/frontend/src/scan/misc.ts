import type { Patient } from "myclinic-model";
import type { ScannerDevice } from "myclinic-model/model";

export function makePatientText(p: Patient | undefined): string {
  if( p == undefined ){
    return "（未選択）";
  } else {
    return `(${p.patientId}) ${p.fullName()}`;
  }
}

export function makeScannerText(d: ScannerDevice | undefined): string {
  if( d == undefined ){
    return "（未選択）";
  } else {
    return d.description;
  }

}
