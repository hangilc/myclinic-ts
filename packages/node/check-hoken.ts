// check-hoken --- checks for currently overlapping hoken (Shahokokuho and Koukikourei)

import * as mysql from "mysql";
import { dateToSqlDate, Koukikourei, Shahokokuho } from "myclinic-model";
import { coerceRow, coerceShahokokuho } from "./db.js";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env["MYCLINIC_DB_HOST"],
  user: process.env["MYCLINIC_DB_USER"],
  password: process.env["MYCLINIC_DB_PASS"],
  database: "myclinic",
  dateStrings: true,
});

start();

async function start() {
  const at: string = dateToSqlDate(new Date());
  const shahokokuhoList = await listShahokokuho(at);
  const koukikoureiList = await listKoukikourei(at);
  const map: Record<number, (Shahokokuho | Koukikourei)[]> = {};
  for(let h of shahokokuhoList){
    if( !(h.patientId in map) ){
      map[h.patientId] = [h];
    } else {
      map[h.patientId].push(h);
    }
  }
   for(let h of koukikoureiList){
    if( !(h.patientId in map) ){
      map[h.patientId] = [h];
    } else {
      map[h.patientId].push(h);
    }
  }
  for(let patientId in map){
    const list = map[patientId];
    if( list.length > 1 ){
      console.log(patientId, list);
    }
  }
  pool.end();
}

async function listShahokokuho(at: string): Promise<Shahokokuho[]> {
  return new Promise(async (resolve, reject) => {
    pool.query("select * from hoken_shahokokuho order by shahokokuho_id", (err, rows) => {
      if( err ){
        reject(err);
      }
      const result = [];
      for(let r of rows){
        const h = Shahokokuho.cast(coerceShahokokuho(r));
        if( h.isValidAt(at) ){
          result.push(h);
        }
      }
      resolve(result);
    })
  })
}

async function listKoukikourei(at: string): Promise<Koukikourei[]> {
  return new Promise(async (resolve, reject) => {
    pool.query("select * from hoken_koukikourei order by koukikourei_id", (err, rows) => {
      if( err ){
        reject(err);
      }
      const result = [];
      for(let r of rows){
        const h = Koukikourei.cast(coerceRow(r));
        if( h.isValidAt(at) ){
          result.push(h);
        }
      }
      resolve(result);
    })
  })
}



