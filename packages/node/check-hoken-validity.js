// check-hoken-validity --- checks hoken validity in visit

import { Shahokokuho, Visit } from "myclinic-model";
import * as mysql from "mysql";

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
  const result1 = await checkShahokokuho();
  const result2 = await checkKoukikourei();
  const map = {}
  for(let r of [...result1, ...result2]) {
    const patientId = r.patient_id;
    if( patientId in map ){
      map[patientId].push(r);
    } else {
      map[patientId] = [r];
    }
  }
  for(let patientId in map){
    const list = map[patientId].map(v => {
      const obj = Object.assign({}, {
        datetime: v.v_datetime
      });
      if( v.shahokokuho_id ){
        Object.assign(obj, { shahokokuho_id: v.shahokokuho_id })
      }
      if( v.koukikourei_id ){
        Object.assign(obj, { koukikourei_id: v.koukikourei_id })
      }
      return obj;
    });
    console.log("patient-id:", patientId, list);
  }
  console.log(`社保国保 ${result1.length}件`);
  console.log(`後期高齢 ${result2.length}件`);
  pool.end();
}

async function checkShahokokuho() {
  return new Promise((resolve, reject) => {
    const sql = `
    select v.patient_id, v.v_datetime, v.shahokokuho_id
    from hoken_shahokokuho as h inner join visit as v on h.shahokokuho_id = v.shahokokuho_id
    where v.shahokokuho_id > 0
    and DATE(v.v_datetime) < h.valid_from 
    or (
      h.valid_upto != '0000-00-00' and
      DATE(v.v_datetime) > h.valid_upto
    )
  `;
    pool.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve([...rows]);
    });

  });
}

async function checkKoukikourei() {
  return new Promise((resolve, reject) => {
    const sql = `
    select v.patient_id, v.v_datetime, v.koukikourei_id
    from hoken_koukikourei as h inner join visit as v on h.koukikourei_id = v.koukikourei_id
    where v.koukikourei_id > 0
    and DATE(v.v_datetime) < h.valid_from 
    or (
      h.valid_upto != '0000-00-00' and
      DATE(v.v_datetime) > h.valid_upto
    )
  `;
    pool.query(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });

  });
}
