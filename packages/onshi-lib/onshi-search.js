const  https = require("https");
const { dateToSqlDate } = require("myclinic-jslib");

/**
 * オンライン資格確認を実行する
 * @param {string} idToken - login で取得した idToken
 * @param { Object } query - 確認する保険の情報
 * @param { string } query.hokensha - 保険者番号
 * @param { string } query.hihokensha - 被保険者番号
 * @param { string } query.kigou? - 被保険者記号 (optional)
 * @param { string } query.birthdate - 生年月日 (YYYYMMDD)
 * @param { string } query.confirmationDate - 確認日 (YYYYMMDD)
 * @returns { Object } オンライン資格確認情報 (JSON)
 */
async function onshiSearch(idToken, query, debug = false) {
  const confirmationDate = query.confirmationDate ?? dateToSqlDate(new Date()).replaceAll("-", "");
  const url = "https://hweb-mnc.oqs.onshikaku.org";
  const path = "/oqs-api-pro/MSA01030/ILI01030SV01/search";
  const body = {
    "XmlMsg": {
      "MessageHeader": {
        "QualificationConfirmationDate": confirmationDate,
        "MedicalInstitutionCode": process.env["ONSHI_INSTITUTE_CODE"]
      },
      "MessageBody": {
        "QualificationConfirmSearchInfo": {
          "InsurerNumber": query.hokensha,
          "InsuredCardSymbol": query.kigou,
          "InsuredIdentificationNumber": query.hihokensha,
          "Birthdate": query.birthdate,
          "LimitApplicationCertificateRelatedConsFlg": "1", // 限度額適用認定証関連情報の開示に係る同意有無を設定するフラグ。0:未同意、1:同意

        }
      }
    }
  }
  const json = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      path,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": idToken,
        "Content-Length": json.length.toString()
      },
      rejectUnauthorized: false,
    }, (res) => {
      let msg = "";
      res.setEncoding("utf-8");
      res.on("data", str => {
        msg += str;
      });
      res.on("end", () => {
        if( debug ){
          console.log(msg);
        }
        resolve(msg);
      })
    })
    req.write(json);
    req.end();
  })
}

module.exports = {
  onshiSearch
}