export interface Store {
  issueDate: string;
  patientName: string;
  patientSex: "M" | "F";
  patientBirthdate: string;
  diseases: ("diabetes" | "hypertension" | "hyperlipidemia")[];
  targetBodyWeight: string;
  targetBMI: string;
  targetBloodPressure: string;
  targetHbA1c: string;
  achievementTarget: string;
  behaviorTarget: string;
}
