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

test("basic info", () => {
  const r = OnshiResult.cast(kourei);
  console.log(JSON.stringify(r, undefined, 2));
  expect(r).toHaveProperty("XmlMsg");
});

export { }