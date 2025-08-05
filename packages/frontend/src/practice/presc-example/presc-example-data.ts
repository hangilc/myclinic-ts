import type { PrescExample } from "@/lib/presc-example";

export interface PrescExampleData {
  data: PrescExample;
  id: number;
  isEditingComment: boolean;
  commentInput: string;
};

let serialId = 1;

export function createPrescExampleData(data: PrescExample): PrescExampleData {
  return {
    data, 
    id: serialId++,
    isEditingComment: false,
    commentInput: "",
  }
}
