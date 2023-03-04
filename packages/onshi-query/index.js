// onshi-query -- 患者のオンライン資格確認を行う
// Usage: node index.js patient-id date
//   date: confirmationDate (YYYY-MM-DD)

const mysql = require("mysql2/promise");
const { readCerts, onshiLogin, onshiSearch } = require("onshi-lib");
const { pad, dateToSqlDate } = require("myclinic-jslib");

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
    database: "myclinic"
  });
  const [rs] = await conn.query("select * from patient where patient_id = ?", [patientId]);
  const patient = rs[0];
  if( !patient ){
    throw new Error("Cannot find patient with patient-id " + patientId);
  }
  console.log(patient);
  const [shahoList] = await conn.query(`
    select * from hoken_shahokokuho where patient_id = ? 
      and valid_from <= ? and (valid_upto = '0000-00-00' or ? <= valid_upto)
  `, [ patientId, confirmDate, confirmDate ]);
  const shaho = shahoList[0];
  console.log("shaho-length", shahoList.length);
  if( shaho ){
    console.log(shaho);
    const result = await onshiLogin(certs.certFile, certs.keyFile, certs.jsonFile);
    const idToken = result.result.idToken;
    const r = await onshiSearch(idToken, {
      hokensha: pad(shaho.hokensha_bangou, 8, "0"),
      hihokensha: shaho.hihokensha_bangou,
      kigou: shaho.hihokensha_kigou,
      birthdate: dateToSqlDate(patient.birth_day).replaceAll("-", ""),
      confirmationDate: confirmDate.replaceAll("-", "")
    });
    console.log(JSON.stringify(r, undefined, 2));
  }
  const [koukikoureiList] = await conn.query(`
    select * from hoken_koukikourei where patient_id = ?
    and valid_from <= ? and (valid_upto = '0000-00-00' or ? <= valid_upto)
  `, [ patientId, confirmDate, confirmDate ]);
  const koukikourei = koukikoureiList[0];
  if( koukikourei ){
    console.log(koukikourei);
    const result = await onshiLogin(certs.certFile, certs.keyFile, certs.jsonFile);
    const idToken = result.result.idToken;
    const r = await onshiSearch(idToken, {
      hokensha: pad(koukikourei.hokensha_bangou, 8, " "),
      hihokensha: koukikourei.hihokensha_bangou,
      birthdate: dateToSqlDate(patient.birth_day).replaceAll("-", ""),
      confirmationDate: confirmDate.replaceAll("-", "")
    });
    console.log(JSON.stringify(r, undefined, 2));
  }
  const [kouhiList] = await conn.query(`
    select * from kouhi where patient_id = ?
    and valid_from <= ? and (valid_upto = '0000-00-00' or ? <= valid_upto)
  `, [ patientId, confirmDate, confirmDate ]);
  const kouhiProms = kouhiList.map(async (kouhi) => {
    console.log(kouhi);
    const result = await onshiLogin(certs.certFile, certs.keyFile, certs.jsonFile);
    const idToken = result.result.idToken;
    return await onshiSearch(idToken, {
      hokensha: pad(kouhi.futansha, 8, " "),
      hihokensha: kouhi.jukyuusha,
      birthdate: dateToSqlDate(patient.birth_day).replaceAll("-", ""),
      confirmationDate: confirmDate.replaceAll("-", "")
    });
  });
  const kouhiConfirms = await Promise.all(kouhiProms);
  kouhiConfirms.forEach(c => {
    console.log(JSON.stringify(c, undefined, 2));
  });
  await conn.end();
}