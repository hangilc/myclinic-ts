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

test("basic info", () => {
  const r = OnshiResult.cast(koukikourei);
  console.log(JSON.stringify(r, undefined, 2));
  console.log("processExecutionTime", r.messageHeader.processExecutionTime);
  console.log("qualificationConfirmationDate", r.messageHeader.qualificationConfirmationDate);
  console.log("medicalInstitutionCode", r.messageHeader.medicalInstitutionCode);
  console.log("referenceClassification", r.messageHeader.referenceClassification);
  console.log("segmentOfResult", r.messageHeader.segmentOfResult);
  console.log("characterCodeIdentifier", r.messageHeader.characterCodeIdentifier);
  expect(r).toHaveProperty("XmlMsg");
});

export { }