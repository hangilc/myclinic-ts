import type { ByoumeiMaster, DiseaseExample, ShuushokugoMaster } from "myclinic-model";

export interface SearchResult {
  label: string;
  data: ByoumeiMaster | ShuushokugoMaster | DiseaseExample;
}
