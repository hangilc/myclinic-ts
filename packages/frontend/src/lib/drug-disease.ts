export interface DrugDisease {
  id: string;
  drugName: string;
  diseaseName: string;
  fix?: {
    pre: string;
    name: string;
    post: string;
  }
}

export function hasMatchingDrugDisease(drugName: string, diseaseNames: string[], drugDiseases: DrugDisease[]): boolean {
  for (let item of drugDiseases) {
    if (drugName.includes(item.drugName)) {
      for(let diseaseName of diseaseNames) {
        if( diseaseName.includes(item.diseaseName) ){
          return true;
        }
      }
    }
  }
  return false;
}