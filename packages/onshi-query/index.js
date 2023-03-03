// onshi-query -- 患者のオンライン資格確認を行う
// Usage: node index.js patient-id date
//   date: confirmationDate (YYYY-MM-DD)

const mysql = require("mysql2/promise");
const { readCerts, onshiLogin, onshiSearch } = require("onshi-lib");
const { pad } = require("myclinic-jslib");

const patientId = parseInt(process.argv[2]);
const confirmDate = process.argv[3];

if( isNaN(patientId) ){
  console.log("Error: invalid patient-id: " + process.argv[2]);
  usage();
}
if( !/^\d{4}-\d{2}-\d{2}$/.test(confirmDate) ){
  console.log("Error: invalid confirmation date");
  usage();
}

function usage(exitCode = 1) {
  console.log("Usage: nodex index.js patient-id date");
  console.log("  date: confirmationDate (YYYY-MM-DD)")
  process.exit(exitCode);
}

const certs = readCerts();

main();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env["MYCLINIC_DB_HOST"],
    user: process.env["MYCLINIC_DB_USER"],
    password: process.env["MYCLINIC_DB_PASS"],
    database: "myclinic",
    timezone: "JST"
  });
  const [rs] = await conn.query("select * from patient where patient_id = ?", [patientId]);
  const patient = rs[0];
  if( !patient ){
    throw new Error("Cannot find patient with patient-id " + patientId);
  }
  console.log(patient);
  const [shahoList] = await conn.query(`
    select * from hoken_shahokokuho where patient_id = ? 
      and valid_from <= ? and ? <= valid_upto
    `, [ patientId, confirmDate, confirmDate ]);
  console.log(shahoList);
  const shaho = shahoList[0];
  if( shaho ){
    const result = await onshiLogin(certs.certFile, certs.keyFile, certs.jsonFile);
    const idToken = result.result.idToken;
    const r = await onshiSearch(idToken, {
      hokensha: pad(shaho.hokenshaBangou, 8, " "),
      hihokensha: shaho.hihokenshaBangou,
      kigou: shaho.hihokenshaKigou,
      birthdate: patient.birthday.replaceAll("-", ""),
      confirmationDate: confirmation.replaceAll("-", "")
    });
    console.log(r);
  }
  await conn.end();
}