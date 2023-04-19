import * as mysql from "mysql";
import { OnshiResult, setQuiet } from "onshi-result";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .options({
    f: {
      type: "boolean",
      default: false,
      description: "fix improper onshi result",
      alias: "fix",
    },
    "visit-id": {
      type: "number",
      desciption: "visit-id",
    }
  }).parseSync();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env["MYCLINIC_DB_HOST"],
  user: process.env["MYCLINIC_DB_USER"],
  password: process.env["MYCLINIC_DB_PASS"],
  database: "myclinic"
});

setQuiet(true);

class CheckOnshiOk {
  readonly checkIsOk: boolean = true;
}

class CheckOnshiFixed {
  readonly checkIsFixed: boolean = true;
  fixed: OnshiResult

  constructor(fixed: OnshiResult) {
    this.fixed = fixed;
  }
}

class CheckOnshiFailure {
  readonly checkIsFialure: boolean = true;
  error: any;

  constructor(error: any) {
    this.error = error;
  }
}

function isOk(arg: any): arg is CheckOnshiOk {
  return typeof arg === "object" && arg.checkIsOk;
}

function isFixed(arg: any): arg is CheckOnshiFixed {
  return typeof arg === "object" && arg.checkIsFixed;
}

function isFailure(arg: any): arg is CheckOnshiFailure {
  return typeof arg === "object" && arg.checkIsFailure;
}

type CheckOnshiResult = CheckOnshiOk | CheckOnshiFixed | CheckOnshiFailure;

if( argv.visitId ){
  pool.query("select * from onshi where visit_id = ?", [argv.visitId], async (err, rows) => {
    if( err ){
      throw err;
    }
    if( rows.length === 0 ){
      console.log("Not found", argv.visitId);
    } else {
      const row = rows[0];
      console.log("visitId:", row.visit_id);
      const cr = await checkOnshi(row.visit_id, row.kakunin);
      if( isOk(cr) ){
        const result = OnshiResult.cast(JSON.parse(row.kakunin));
        console.log(JSON.stringify(result.toJSON(), undefined, 2));
      } else if( isFixed(cr) ){
        console.log("FIXED");
      } else {
        console.log("ERROR");
        console.log(row.kakunin);
      }
    }
    process.exit(0);
  });
} else {
  pool.query("select * from onshi order by visit_id", async (err: mysql.MysqlError, rows: any) => {
    if( err ){
      throw err;
    }
    let handled: number = 0;
    let errors: number = 0;
    let fixed: number = 0;
    await Promise.all(rows.map(async row => {
      handled += 1;
      const visitId = row.visit_id;
      const kakunin = row.kakunin;
      const cr = await checkOnshi(visitId, kakunin);
      if( isOk(cr) ){
        // nop
      } else if( isFixed(cr) ){
        errors += 1;
        console.log("fixed visit-id:", visitId);
        fixed += 1;
      } else {
        errors += 1;
        console.log("ERROR");
        console.log("visit-id:", visitId);
        console.log("kakunin:", kakunin);
        console.log(cr.error);
      }
    }));
    console.log("handled", handled);
    console.log("errors", errors);
    console.log("fixed", fixed);
    process.exit(0);
  });
}

function checkOnshi(visitId: number, kakunin: string): Promise<CheckOnshiResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const json = JSON.parse(kakunin);
      try {
        const result = OnshiResult.cast(json);
        resolve(new CheckOnshiOk());
      } catch(ex) {
        if( argv.fix ){
          const strObj = stringValues(json);
          try {
            const result = OnshiResult.cast(strObj);
            await setOnshi(visitId, result);
            resolve(new CheckOnshiFixed(result));
          } catch(_ex2) {
            resolve(new CheckOnshiFailure(ex));
          }
        } else {
          resolve(new CheckOnshiFailure(ex));
        }
      }
    } catch(ex){
      reject(ex);
    }
  });
}

async function setOnshi(visitId: number, result: OnshiResult): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const kakunin = JSON.stringify(result.toJSON());
    pool.query("update onshi set kakunin = ? where visit_id = ?",
      [kakunin, visitId],
      function(err, _result) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      })
  });
}

function stringValues(obj: any): any {
  if (typeof obj === "number") {
    return obj.toString();
  } else if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      const a: any[] = [];
      for (let e of obj) {
        a.push(stringValues(e));
      }
      return a;
    } else {
      const o: any = {};
      for (let key in obj) {
        o[key] = stringValues(obj[key]);
      }
      return o;
    }
  } else {
    return obj;
  }
}


