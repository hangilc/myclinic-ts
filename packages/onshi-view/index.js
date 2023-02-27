const express = require("express");
const app = express();
const fs = require("fs");

let directory = ".";
let port = 9090;

app.get("/", (req, res) => {
  fs.readdir(directory, (err, files) => {
    if( err ){
      console.log(err);
      res.send("[]");
    } else {
      res.send(JSON.stringify(files));
    }
  })
});

app.listen(port, () => {
  
})