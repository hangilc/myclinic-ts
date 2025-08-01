// Usage: npx vite-node conv-presc-sample.ts SAMPLE.TXT
// read-lines.ts
import type { Drug, DrugGroup, Shohou, Usage } from '@/lib/parse-shohou';
import { parseDrugLine, parseUsageLine, type ParsedDrug } from '@/lib/parse-shohou3';
import * as fs from 'fs';
import * as readline from 'readline';

async function run() {
  const sampleFile = process.argv[2];
  if (!sampleFile) {
    throw new Error("cannot get sample file\nUsage: npx vite-node conv-presc-sample.ts SAMPLE.TXT")
  }
  const fileStream = fs.createReadStream(sampleFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // normalize \r\n and \n
  });
  const list: DrugGroup[] = [];

  let drug: Drug | undefined = undefined;
  let usage: Usage | undefined = undefined;
  let comment: string | undefined = undefined;
  for await (let line of rl) {
    if (line.startsWith(" ") || line.startsWith("　")) {
      usage = parseUsageLine(line);
    } else if (/^\s*$/.test(line)) {
      if (drug && usage) {
        list.push({ drugs: [drug], usage, groupComments: [] })
        drug = undefined;
        usage = undefined;
        comment = undefined;
      } else if (drug || usage) {
        throw new Error(`skipping: ${drug} | ${usage}`);
      }
    } else if (line.startsWith("@_comment:")) {
      comment = line.trim();
    } else {
      const parsed = parseDrugLine(line);
      if (!parsed) {
        console.log("failed to parse drug line", line);
        drug = undefined;
      } else {
        drug = Object.assign({ drugComments: [] }, parsed);
      }
    }
  }

  for (let g of list) {
    console.log(g);
  }
}

run();