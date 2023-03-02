import express from "express";
import fs from "fs";

const app = express();
let port: number = 8880;
const DATA_DIR = process.env["MYCLINIC_DATA"];
if( !DATA_DIR ){
  console.error("Cannot find env var: MYCLINIC_DATA");
  process.exit(2);
}
const DICT_FILE: string = `${DATA_DIR}/dict.json`;
if( !fs.existsSync(DICT_FILE) ) {
  fs.writeFileSync(DICT_FILE, "{}");
}

app.get("/dict-get/:key", (req, res, next) => {
  const data = fs.readFile(DICT_FILE, { encoding: "utf8" }, (err, buffer) => {
    if( err ){
      next(err);
    } else {
      const key = req.params["key"];
      const dict = JSON.parse(buffer);
      const val = dict[key] ?? null;
      res.set({ "Content-Type": "application/json"});
      res.send(val);
    }
  })
});

app.listen(port, () => {
  console.log("node-server listening on port " + port);
});