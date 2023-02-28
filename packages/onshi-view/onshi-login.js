function onshiLogin(certFile, keyFile, jsonFile) {
  const https = require("https");
  
  const url = "https://hweb-api.oqs.onshikaku.org";
  const path = "/oqs-api-pro/MSA12020/ILI12020SV01/auth";
  return new Promise((resolve, reject) => {
    const body = jsonFile;
    const req = https.request(url, {
      path,
      method: "POST",
      cert: certFile,
      key: keyFile,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Content-Length": body.length.toString(),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let msg = "";
      res.setEncoding("utf-8");
      res.on("data", (str) => {
        msg += str;
      })
      res.on("end", () => {
        resolve(JSON.parse(msg));
      })
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.onshiLogin = onshiLogin;
