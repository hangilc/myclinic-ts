const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");

const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const { onshiLogin, onshiSearch } = require("onshi-lib");

let faceDir = resolveFaceDir();
let certDir = resolveCertDir();
let certFile;
let keyFile;
let jsonFile;
if( certDir ){
  certFile = fs.readFileSync(path.resolve(certDir, "cert.pem")).toString();
  keyFile = fs.readFileSync(path.resolve(certDir, "key.pem")).toString();
  jsonFile = fs.readFileSync(path.resolve(certDir, "body.json")).toString();
}
let port = 443;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());

app.get("/face", (req, res) => {
  fs.readdir(faceDir, (err, files) => {
    if( err ){
      console.log(err);
      res.send("[]");
    } else {
      res.send(JSON.stringify(files));
    }
  })
});

app.get("/face/:file", (req, res, next) => {
  const fpath = path.resolve(faceDir, req.params["file"]);
  fs.readFile(fpath, { encoding: "UTF-8" }, (err, buffer) => {
    if( err ){
      next(err);
    } else {
      res.set({ "Content-Type": "application/xml" })
      res.send(buffer);
    }
  })
});

app.post("/onshi/kakunin", async (req, res, next) => {
  const query = req.body;
  console.log("query", typeof query, query, query.confirmationDate)
  if( !certDir ){
    throw new Error("Cannot find certification directory");
  }
  const token = await onshiLogin(
    certFile, keyFile, jsonFile
  );
  const idToken = token.result.idToken;
  const result = await onshiSearch(idToken, query, true);
  res.set({ "Content-Type": "application/json" })
  res.send(result);
});

const ws = new WebSocketServer({ port: 9091 });

const ws_peers = [];

ws.on("connection", conn => {
  conn.on("error", console.error);

  conn.on("message", data => {
    console.log("received ws message", data);
  });

  conn.on("close", () => {
    const i = ws_peers.findIndex((c) => c === conn);
    if( i >= 0 ){
      ws_peers.splice(i, 1);
      console.log(ws_peers);
    }
  })

  ws_peers.push(conn);
});

fs.watch(faceDir, (eventType, fileName) => {
  console.log(eventType, fileName);
  if( eventType === "change" ){
    ws_peers.forEach(peer => {
      const data = {
        type: "watch",
        body: fileName
      }
      peer.send(JSON.stringify(data));
    })
  }
});

const server = https.createServer({
  cert: fs.readFileSync(process.env["ONSHI_VIEW_TLS_CERT"]),
  key: fs.readFileSync(process.env["ONSHI_VIEW_TLS_KEY"]),
}, app)

server.listen(port, () => {
  console.log(`onshi-view listening to port ${port}`)
})

function resolveFaceDir() {
  const d = process.env["ONSHI_FACE_DIR"];
  if( !d ){
    throw new Error("Cannot find env var: ONSHI_FACE_DIR");
  }
  return d;
}

function resolveCertDir() {
  const d = process.env["ONSHI_CERT_DIR"];
  return d;
}