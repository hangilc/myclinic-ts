import type { Patient } from "myclinic-model";
import type { ComponentType } from "svelte";
import type { Hoken } from "./hoken";

export class PatientData {
  constructor(
    public patient: Patient,
    public currentHoken: Hoken[],
    public allHoken: Hoken[] | undefined = undefined,
    public stack: ComponentType[] = []
  ) {}
}