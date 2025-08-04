import type { PrescExample } from "@/lib/presc-example";

export interface PrescExampleData {
  data: PrescExample;
  id: number;
};

let serialId = 1;

export function createPrescExampleData(data: PrescExample): PrescExampleData {
  return {
    data, id: serialId++,
  }
}
