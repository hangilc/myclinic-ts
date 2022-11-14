// Usage: node online.js DATA-FILE

import { RcptData, RcptDataObject } from "./rcpt-data";

const dataFile = process.argv[2];
run();

async function run() {
  const data = RcptDataObject.readFromXmlFile(dataFile);
  console.log(data);
}