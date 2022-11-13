// Usage: node online.js DATA-FILE

import { Parser } from "xml2js";
import { readFileSync } from "fs";

const dataFile = process.argv[2];
const dataContent = readFileSync(dataFile, "utf8");
const parser = new Parser({});
run();

async function run() {
  const xml = await parser.parseStringPromise(dataContent);
  console.log(xml);
}