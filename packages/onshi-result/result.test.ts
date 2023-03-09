import fs from "fs";
import path from "path";
import { OnshiResult } from "./result";

const EXAMPLE_DIR = process.env["ONSHI_EXAMPLE"] as string;
const shaho = fs.readFileSync(path.resolve(EXAMPLE_DIR, "shaho-result-example.json")).toString();

test("basic info", () => {
   const r = OnshiResult.cast(shaho);
  // expect(r).toHaveProperty("XmlMsg");
});

export {}