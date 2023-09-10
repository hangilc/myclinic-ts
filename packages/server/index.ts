import express from "express";

const app = express();
const port = 6200;

app.get("/", (req, res) => {
  res.send("Hello, world");
});

app.listen(port, "127.0.0.1", () => console.log("server listening to port " + port));