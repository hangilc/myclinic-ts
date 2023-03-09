const { onshiLogin } = require("./onshi-login");
const { onshiSearch } = require("./onshi-search");
const props = require("./properties");
const fs = require("fs");
const path = require("path");

/**
 * Directory から cert file, key file, setting file を読み込んで object として返す
 * @param {string} certDir - 使用する directory
 * @returns { {certFile: string, keyFile: string, jsonFile: string} }
 */
function readCertsFromDir(certDir) {
  return {
    certFile: fs.readFileSync(path.resolve(certDir, "cert.pem")).toString(),
    keyFile: fs.readFileSync(path.resolve(certDir, "key.pem")).toString(),
    jsonFile: fs.readFileSync(path.resolve(certDir, "body.json")).toString(),
  }
}

/**
 * 環境変数 ONSHI_CERT_DIR で指定された directory から認証情報をよみとる
 * @returns { {certFile: string, keyFile: string, jsonFile: string} }
 */
function readCerts() {
  const dir = process.env["ONSHI_CERT_DIR"];
  if( !dir ){
    throw new Error("Canno find env var: ONSHI_CERT_DIR");
  }
  return readCertsFromDir(dir);
}

module.exports = {
  onshiLogin, readCerts, readCertsFromDir, onshiSearch,
  ...props,
}
