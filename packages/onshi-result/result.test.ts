import fs from "fs";
import path from "path";
import { OnshiResult } from "./result";

const EXAMPLE_DIR = process.env["ONSHI_EXAMPLE"] as string;
const shaho = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "shaho-result-example.json")).toString()
);
const kourei = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "kourei-jukyuu-example.json")).toString()
);
const koukikourei = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "koukikourei-example.json")).toString()
);

test("load shaho", () => {
  const r = OnshiResult.cast(shaho);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
});

test("load kourei", () => {
  const r = OnshiResult.cast(kourei);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
});

test("load koukikourei", () => {
  const r = OnshiResult.cast(koukikourei);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
});

