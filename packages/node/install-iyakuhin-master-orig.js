// Usage: node install-iyakuhin-master.js Y.ZIP start-date

// const AdmZip = require("adm-zip");
// const iconv = require("iconv-lite");
// const { parse } = require("csv-parse/sync");
// const mysql = require("mysql");
import AdmZip from "adm-zip";
import path from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";
import mysql from "mysql";

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

const HenkouKubunNoChange = 0;
const HenkouKubunMasshou = 1;
const HenkouKubunShinki = 3;
const HenkouKubunHenkou = 5;
const HenkouKubunHaishi = 9;

const zipFile = process.argv[2];
const startDate = process.argv[3];
if( process.argv.length !== 4 ){
  console.log("usage: Usage: node install-iyakuhin-master.js Y.ZIP start-date");
  process.exit(1);
}
if( !zipFile ){
  console.log("Empty file name");
  process.exit(1);
}
if( !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ){
  console.log("Invalid start date, it should be in xxxx-xx-xx format.");
  process.exit(1);
}

const connConfig = {
  host: process.env["MYCLINIC_DB_HOST"] || "127.0.0.1",
  user: process.env["MYCLINIC_DB_USER"],
  password: process.env["MYCLINIC_DB_PASS"],
  database: "myclinic",
  charset: "utf8",
};

extractMasterContent(zipFile, (err, content) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else if (content) {
    const conn = mysql.createConnection(connConfig);
    conn.connect();
    conn.beginTransaction();
    parse(content)
      .map((row) => rowToEntry(new Row(row)))
      .map(e => entryToMaster(e, startDate))
      .forEach(m => {
        enterIyakuhinMaster(conn, m);
      });
    conn.commit();
    conn.end();
  }
});

/**
 * @param {string} content - content of y.csv file
 */
function handleContent(content) {
  console.log("length", content.length);
}

/**
 * @param {string} fileName - file name of y.zip file
 * @param {(err: string | undefined, content: string | undefined) => void} cb - callback function
 */
function extractMasterContent(fileName, cb) {
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
  cb(err, content);
}

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

// zip.getEntries().forEach((entry) => {
//   if (entry.entryName === "y.csv") {
//     zipEntry = entry;
//   }
// });
// if (zipEntry === undefined) {
//   console.error("Cannot find y.csv in zip");
// } else {
//   const csvContent = iconv.decode(zipEntry.getData(), "SHIFT_JIS");
//   const csvRows = parse(csvContent);
//   let entries = csvRows.map((csvRow) => rowToEntry(new Row(csvRow)));
//   entries = entries.filter(
//     (r) => r.kubun !== HenkouKubunHaishi && r.kubun !== HenkouKubunMasshou
//   );
//   entries = entries.filter((r) => r.yakka.length <= 10);
//   const validFrom = dateToSqldate(new Date());
//   const validUpto = "0000-00-00";
//   masters = entries.map((entry) => entryToMaster(entry, validFrom, validUpto));
//   const conn = mysql.createConnection({
//     host: process.env["MYCLINIC_DB_HOST"] || "127.0.0.1",
//     user: process.env["MYCLINIC_DB_USER"],
//     password: process.env["MYCLINIC_DB_PASS"],
//     database: "myclinic",
//     charset: "utf8",
//   });
//   conn.connect();
//   conn.beginTransaction();
//   masters.forEach((master) => enter(conn, master));
//   conn.commit();
//   conn.end();
// }

/**
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

function dateToSqldate(date) {
  return date.toISOString().substring(0, 10);
}

function enterIyakuhinMaster(conn, master) {
  conn.query("insert into iyakuhin_master_arch set ?", master);
}
