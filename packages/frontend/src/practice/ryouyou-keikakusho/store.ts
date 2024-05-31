export interface Store {
  issueDate: string;
  diseases: ("diabetes" | "hypertension" | "hyperlipidemia")[];
  targetBodyWeight: string;
  targetBMI: string;
  targetBloodPressure: string;
  targetHbA1c: string;
  achievementTarget: string;
  behaviorTarget: string;
  immediates: Record<string, string>;
}
