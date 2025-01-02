// Usage: node install-iyakuhin-master.js Y.ZIP start-date

import path from "node:path";
import AdmZip from "adm-zip";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";
import mysql from "mysql";
import { incDay } from "myclinic-util";

import * as promptSync from "prompt-sync";
let prompt = promptSync.default({ sigint: true });

/**
 * @class Row
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

/**
 * @description config for mysql connection
 */
const connConfig = {
  host: process.env["MYCLINIC_DB_HOST"] || "127.0.0.1",
  user: process.env["MYCLINIC_DB_USER"],
  password: process.env["MYCLINIC_DB_PASS"],
  database: "myclinic",
  charset: "utf8",
};

// parse command args
if (process.argv.length !== 4) {
  console.log("usage: Usage: node install-iyakuhin-master.js Y.ZIP start-date");
  process.exit(1);
}
const zipFile = process.argv[2];
const startDate = process.argv[3];
if (!zipFile) {
  console.log("Empty file name");
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
  console.log("Invalid start date, it should be in xxxx-xx-xx format.");
  process.exit(1);
}
let conn = undefined;

// read csv data
let csvContent = await extractMasterContent(zipFile);
let masters = parseCSVcontent(csvContent, startDate);
askContinue(`There area ${masters.length} masters in ${zipFile}.`);

// connect to DB
conn = mysql.createConnection(connConfig);
conn.connect();
conn.beginTransaction();

// count current orphans
let origOrphans = await countCurrentOrphans(conn);
if (origOrphans > 0) {
  askContinue(`Current number of orphan drugs is ${origOrphans}`);
}

// count current effectives
const numCurrentEffectiveMasters = await countCurrentEffectiveMasters(conn);
askContinue(
  `Number of currently effective masters are ${numCurrentEffectiveMasters}.`
);

// updat validUpto of current effectives
const prevDate = calcPrevDate(startDate);
askContinue(`Updates valid_upto of current effective to ${prevDate}`);
await invalidateCurrent(conn, prevDate);
let updatedOrphans = await countCurrentOrphans(conn);
if (updatedOrphans > 0) {
  askContinue(`Updated number of orphans is ${updatedOrphans}`);
}

// filter masters which has yakka length <= 10
masters = masters.filter((m) => m.yakka.length <= 10);

// enter new masters
await Promise.all(masters.map(async (m) => await enterIyakuhinMaster(conn, m)));

// confirm commit
askContinue("Commit changes?");
conn.commit();

// close conn
conn.end();

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
  if (err) {
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
 * @param {string} startDate -- value for validFrom in Master
 * @returns {object[]} -- array of IyakuhinMaster
 */
function parseCSVcontent(content, startDate) {
  return parse(content)
    .map((row) => rowToEntry(new Row(row)))
    .map((e) => entryToMaster(e, startDate));
}

/**
 * @description prompts message to stdout and asks for continuation
 * @param {string} msg
 */
function askContinue(msg) {
  let ans = prompt(msg + " Continue? (y/n): ");
  if (ans === "n") {
    if (conn) {
      conn.rollback();
    }
    process.exit(1);
  }
}

/**
 * @description counts number of current effective masters (i.e., validUpto === '0000-00-00')
 * @param conn - mysql connection
 * @returns {Promise<number>}
 */
function countCurrentEffectiveMasters(conn) {
  const sql =
    "select count(*) as c from iyakuhin_master_arch where valid_upto = '0000-00-00'";
  return new Promise((resolve, reject) => {
    conn.query(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const n = rows[0].c;
        resolve(n);
      }
    });
  });
}

/**
 * @description invalidates currently effective masters (i.e., sets validUpto)
 * @param conn - mysql connection
 * @param {string} validUpto
 */
function invalidateCurrent(conn, validUpto) {
  const sql =
    "update iyakuhin_master_arch set valid_upto = ? where valid_upto = '0000-00-00'";
  return new Promise((resolve, reject) => {
    conn.query(sql, [validUpto], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @description counts number of current orphan drugs in visit_drug and visit_conduct_drug
 * @param conn
 * @return {Promise<number>}
 */
async function countCurrentOrphans(conn) {
  const n = await countCurrentOrphanVisitDrugs(conn);
  const m = await countCurrentOrphanVisitConductDrugs(conn);
  return n + m;
}

function countCurrentOrphanVisitDrugs(conn) {
  const sql = `
    select
      count(*) as c
    from
      visit_drug as d
    where
      not exists(
          select
              *
          from
              visit as v
              inner join iyakuhin_master_arch as m
          where
              d.visit_id = v.visit_id
              and d.d_iyakuhincode = m.iyakuhincode
              and m.valid_from <= date(v.v_datetime)
              and (
                  m.valid_upto = '0000-00-00'
                  or date(v.v_datetime) <= m.valid_upto
              )
  )`;
  return new Promise((resolve, reject) => {
    conn.query(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0].c);
      }
    });
  });
}

function countCurrentOrphanVisitConductDrugs(conn) {
  const sql = `
    select
      count(d.iyakuhincode) as c
    from
      visit_conduct_drug as d
    where
      not exists(
          select
              *
          from
              visit_conduct as c
              inner join visit as v on c.visit_id = v.visit_id
              inner join iyakuhin_master_arch as m
          where
              d.visit_conduct_id = c.id
              and m.iyakuhincode = d.iyakuhincode
              and m.valid_from <= date(v.v_datetime)
              and (
                  m.valid_upto = '0000-00-00'
                  or date(v.v_datetime) <= m.valid_upto
              )
      )  
  `;
  return new Promise((resolve, reject) => {
    conn.query(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0].c);
      }
    });
  });
}

/**
 * @description converts Date to "YYYY-MM-DD" format
 * @param {Date} date
 * @returns {string}
 */
function dateToSqldate(date) {
  return date.toISOString().substring(0, 10);
}

/**
 * @description calculated previous day
 * @param {string} date
 * @returns {string} - previous day in "YYYY-MM-DD" format
 */
function calcPrevDate(date) {
  const prev = incDay(new Date(date), -1);
  return dateToSqldate(prev);
}

/**
 * @description enters iyakuhin master
 * @param conn - mysql connection
 * @param {object} master - iyakuhin master
 * @returns {Promise<void>}
 */
async function enterIyakuhinMaster(conn, master) {
  return new Promise((resolve, reject) => {
    conn.query(
      "insert into iyakuhin_master_arch set ?",
      [master],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
