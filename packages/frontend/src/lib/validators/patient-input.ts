import type { Patient } from "myclinic-model";

export class PatientInput {
  constructor(
    public patientId: number,
    public lastName: string,
    public firstName: string,
    public lastNameYomi: string,
    public firstNameYomi: string,
    public sex: string,
    public birthday: Date,
    public address: string,
    public phone: string
  ) {}

  static fromModel(m: Patient): PatientInput {
    
  }
}