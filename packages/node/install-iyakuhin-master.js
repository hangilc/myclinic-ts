// Usage: node install-iyakuhin-master.js Y.ZIP start-date

import path from "node:path";
import AdmZip from "adm-zip";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";
import * as promptSync from "prompt-sync";
let prompt = promptSync.default({sigint: true});

/**
 * @description convenience class to wrap CSV row
 */
class Row {
  constructor(csvRow) {
    this.csvRow = csvRow;
  }

  getInt(i) {
    return parseInt(this.csvRow[i - 1]);
  }

  getString(i) {
    return this.csvRow[i - 1];
  }
}

// parse command args
if( process.argv.length !== 4 ){
  console.log("usage: Usage: node install-iyakuhin-master.js Y.ZIP start-date");
  process.exit(1);
}
const zipFile = process.argv[2];
const startDate = process.argv[3];
if( !zipFile ){
  console.log("Empty file name");
  process.exit(1);
}
if( !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ){
  console.log("Invalid start date, it should be in xxxx-xx-xx format.");
  process.exit(1);
}

// read csv data
let csvContent = await extractMasterContent(zipFile);
let masters = parseCSVcontent(csvContent);
askContinue(`There area ${masters.length} masters in ${zipFile}.`);


/**
 * @description reads CSV data
 * @param {string} fileName - file name of y.zip file
 * @returns {Promise<string>} - content of master file
 */
async function extractMasterContent(fileName) {
  const name = path.parse(fileName).name;
  const csvFile = `${name}.csv`;
  const zip = new AdmZip(zipFile);
  let err = undefined;
  let content = undefined;
  zip.forEach((entry) => {
    if (content !== undefined) {
      return;
    }
    if (entry.entryName === csvFile) {
      content = iconv.decode(entry.getData(), "SHIFT_JIS");
    }
  });
  if( err ){
    return Promise.reject(err);
  } else {
    return Promise.resolve(content);
  }
}

/**
 * @description - convert Row to Entry data
 * @parameter {Row}
 * @returns {object}
 */
function rowToEntry(row) {
  return {
    kubun: row.getInt(1),
    masterShubetsu: row.getString(2),
    iyakuhincode: row.getInt(3),
    name: row.getString(5),
    yomi: row.getString(7),
    unit: row.getString(10),
    kingakuShubetsu: row.getInt(11),
    yakka: row.getString(12),
    madoku: row.getInt(14),
    kouhatsu: row.getInt(17),
    zaikei: row.getInt(28),
    yakkacode: row.getString(32),
  };
}

/**
 * @description converts Entry data to IyakuhinMaster
 * @param {object} entry
 * @param {string} validFrom - 開始日
 * @param {string} validUpto - 終了日
 */
function entryToMaster(entry, validFrom, validUpto = "0000-00-00") {
  return {
    iyakuhincode: entry.iyakuhincode,
    yakkacode: entry.yakkacode,
    name: entry.name,
    yomi: entry.yomi,
    unit: entry.unit,
    yakka: entry.yakka,
    madoku: entry.madoku.toString(),
    kouhatsu: entry.kouhatsu.toString(),
    zaikei: entry.zaikei.toString(),
    valid_from: validFrom,
    valid_upto: validUpto,
  };
}

/**
 * @description parses CSV content to rows
 * @param {string} content - CSV content
 * @returns {object[]} -- array of IyakuhinMaster
 */
function parseCSVcontent(content) {
  return parse(content)
  .map((row) => rowToEntry(new Row(row)))
  .map(e => entryToMaster(e, startDate));
}

/**
 * @description prompts message to stdout and asks for continuation
 * @param {string} msg
 */
function askContinue(msg) {
  let ans = prompt(msg + " Continue? (y/n): ");
  if( ans === "n" ){
    process.exit(1);
  }
}
