const db = require("./db");
import * as mysql from "mysql";
import * as m from "myclinic-model";

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
  const shahokokuhoList = await listShahokokuho();
  console.log(shahokokuhoList[0]);
  process.exit(0);
}

async function listShahokokuho(): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    pool.query("select * from hoken_shahokokuho order by shahokokuho_id", (err, rows) => {
      if( err ){
        reject(err);
      }
      const result: m.Shahokokuho[] = [];
      for(let r of rows){
        result.push(m.Shahokokuho.cast(db.coerceRow(r)));
      }
      resolve(result);
    })
  })
}
