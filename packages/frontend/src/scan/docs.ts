import { TaskQueue } from "@/lib/task-queue";
import type { ScannedDocData } from "./scanned-doc-data";

export class Docs {
  docs: ScannedDocData[];
  tq: TaskQueue;

  constructor(docs: ScannedDocData[]){
    this.docs = docs;
    this.tq = new TaskQueue();
  }

  
}