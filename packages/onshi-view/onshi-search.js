const  https = require("https");
const { toDateArg } = require("./util");

// query
// {
//   hokensha: string,
//   hihokensha: string,
//   kigou?: string,
//   birthdate: string
//   confirmationDate?: string
// }

async function onshiSearch(idToken, query, debug = false) {
  const confirmationDate = query.confirmationDate ?? toDateArg(new Date());
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
          console.log(JSON.stringify(JSON.parse(msg), null, 2));
        }
        // const resultJson: ResultOfQualificationConfirmation[] | undefined
        //   = JSON.parse(msg).XmlMsg.MessageBody.ResultList?.map((a: any) => a.ResultOfQualificationConfirmation);
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