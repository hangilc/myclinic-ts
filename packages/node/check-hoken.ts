import * as mysql from "mysql";
import { Koukikourei, Shahokokuho } from "myclinic-model";
import { coerceRow, coerceShahokokuho } from "./db.mjs";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env["MYCLINIC_DB_HOST"],
  user: process.env["MYCLINIC_DB_USER"],
  password: process.env["MYCLINIC_DB_PASS"],
  database: "myclinic",
  dateStrings: true,
});

const shahokokuhoList = await listShahokokuho();
const koukikoureiList = await listKoukikourei();
pool.end();

async function listShahokokuho(): Promise<Shahokokuho[]> {
  return new Promise(async (resolve, reject) => {
    pool.query("select * from hoken_shahokokuho order by shahokokuho_id", (err, rows) => {
      if( err ){
        reject(err);
      }
      const result = [];
      for(let r of rows){
        result.push(Shahokokuho.cast(coerceShahokokuho(r)));
      }
      resolve(result);
    })
  })
}

async function listKoukikourei(): Promise<Koukikourei[]> {
  return new Promise(async (resolve, reject) => {
    pool.query("select * from hoken_koukikourei order by koukikourei_id", (err, rows) => {
      if( err ){
        reject(err);
      }
      const result = [];
      for(let r of rows){
        result.push(Koukikourei.cast(coerceRow(r)));
      }
      resolve(result);
    })
  })
}



