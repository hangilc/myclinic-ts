const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

let faceDir = resolveFaceDir();
let port = 9090;

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
})

app.listen(port, () => {
  console.log(`onshi-view listening to port ${port}`)
})

function resolveFaceDir() {
  const d = process.env["ONSHI_FACE_DIR"];
  if( !d ){
    throw new Error("Cannot find env var: ONSHI_FACE_DIR");
  }
  return d;
}