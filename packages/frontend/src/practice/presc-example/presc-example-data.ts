import type { PrescExample } from "@/lib/presc-example";

export interface PrescExampleData {
  data: PrescExample;
  id: number;
  isEditingComment: boolean;
  commentInput: string;
};

let serialId = 1;

export function createPrescExampleData(data: PrescExample): PrescExampleData {
  normalizeComment(data);
  return {
    data, 
    id: serialId++,
    isEditingComment: false,
    commentInput: data.comment ?? "",
  }
}

function normalizeComment(data: PrescExample) {
  if( data.comment ){
    let c = data.comment;
    c = c.replace(/^@_comment:/, "");
    data.comment = c;
  } else {
    return undefined;
  }
}
