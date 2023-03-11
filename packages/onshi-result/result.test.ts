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
  const r = OnshiResult.cast(kourei);
  console.log(JSON.stringify(r, undefined, 2));
  console.log("processExecutionTime", r.messageHeader.processExecutionTime);
  console.log("qualificationConfirmationDate", r.messageHeader.qualificationConfirmationDate);
  console.log("medicalInstitutionCode", r.messageHeader.medicalInstitutionCode);
  console.log("referenceClassification", r.messageHeader.referenceClassification);
  console.log("segmentOfResult", r.messageHeader.segmentOfResult);
  console.log("characterCodeIdentifier", r.messageHeader.characterCodeIdentifier);
  console.log("processingResultStatus", r.messageBody.processingResultStatus);
  console.log("insuredCardClassification", 
    r.messageBody.qualificationConfirmation?.insuredCardClassification);
  console.log("insurerNumber", 
    r.messageBody.qualificationConfirmation?.insurerNumber);
  console.log("personalFamilyClassification", 
    r.messageBody.qualificationConfirmation?.personalFamilyClassification);
  console.log("birthdate", 
    r.messageBody.qualificationConfirmation?.birthdate);
  console.log("koukikoureiFutanWari", 
    r.messageBody.qualificationConfirmation?.koukikoureiFutanWari);
  console.log("insurerName", 
    r.messageBody.qualificationConfirmation?.insurerName);
  console.log("kourei futan wari", 
    r.messageBody.qualificationConfirmation?.kourei?.futanWari);
  expect(r).toHaveProperty("XmlMsg");
});

export { }