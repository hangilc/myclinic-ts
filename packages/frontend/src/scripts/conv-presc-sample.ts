// Usage: npx vite-node conv-presc-sample.ts SAMPLE.TXT
// read-lines.ts
import { getRP剤情報FromGroup } from '@/lib/denshi-editor/denshi-tmpl';
import type { Drug, DrugGroup, Shohou, Usage } from '@/lib/parse-shohou';
import { parseDrugLine, parseUsageLine, type ParsedDrug } from '@/lib/parse-shohou3';
import type { PrescExample } from '@/lib/presc-example';
import * as fs from 'fs';
import * as readline from 'readline';
import clipboard from 'clipboardy';

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
  const list: [DrugGroup, string | undefined][] = [];

  let drug: Drug | undefined = undefined;
  let usage: Usage | undefined = undefined;
  let comment: string | undefined = undefined;
  for await (let line of rl) {
    if (line.startsWith(" ") || line.startsWith("　")) {
      usage = parseUsageLine(line);
    } else if (/^\s*$/.test(line)) {
      if (drug && usage) {
        list.push([{ drugs: [drug], usage, groupComments: [] }, comment])
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

  const gs: PrescExample[] = list.map(([g, c]) => {
    let pg: PrescExample = getRP剤情報FromGroup(g);
    if( c ) {
      pg.comment = c;
    }
    return pg;
  });

  console.log(JSON.stringify(gs, undefined, 2));
  let yes = await askYesNoQuestion("Copy result to clipboard?");
  if( yes ){
    await clipboard.write(JSON.stringify(gs, undefined, 2));
    console.log("copied to clipboard");
  }
}

function askYesNoQuestion(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

run();