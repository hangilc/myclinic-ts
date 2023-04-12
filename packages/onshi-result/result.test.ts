import fs from "fs";
import path from "path";
import { OnshiResult } from "./result";

const EXAMPLE_DIR = process.env["ONSHI_EXAMPLE"] as string;
const shaho = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "shaho-result-example.json")).toString()
);
const shahoData = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "shaho-result-data.json")).toString()
);
const kourei = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "kourei-jukyuu-example.json")).toString()
);
const koureiData = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "kourei-jukyuu-data.json")).toString()
);
const koukikourei = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "koukikourei-example.json")).toString()
);
const koukikoureiData = JSON.parse(
  fs.readFileSync(path.resolve(EXAMPLE_DIR, "koukikourei-data.json")).toString()
);

test("load shaho", () => {
  const r = OnshiResult.cast(shaho);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
  expect(r.toJSON()).toStrictEqual(shaho);
});

test("load kourei", () => {
  const r = OnshiResult.cast(kourei);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
  expect(r.toJSON()).toStrictEqual(kourei);
});

test("load koukikourei", () => {
  const r = OnshiResult.cast(koukikourei);
  expect(r).toHaveProperty("messageHeader");
  expect(r).toHaveProperty("messageBody");
  expect(r.toJSON()).toStrictEqual(koukikourei);
});

test("loaded kourei data", () => {
  const r = OnshiResult.cast(kourei);
  const d = koureiData;
  expect(r.messageHeader.processExecutionTime).toBe(d.messageHeader.processExecutionTime);
  expect(r.messageHeader.qualificationConfirmationDate).toBe(d.messageHeader.qualificationConfirmationDate);
  expect(r.messageHeader.medicalInstitutionCode).toBe(d.messageHeader.medicalInstitutionCode);
  expect(r.messageHeader.referenceClassification).toBe(d.messageHeader.referenceClassification);
  expect(r.messageHeader.segmentOfResult).toBe(d.messageHeader.segmentOfResult);
  expect(r.messageHeader.characterCodeIdentifier).toBe(d.messageHeader.characterCodeIdentifier);
  const q = r.messageBody.qualificationConfirmSearchInfo;
  const e = d.messageBody.qualificationConfirmSearchInfo;
  expect(q).not.toBeUndefined;
  expect(e).not.toBeUndefined;
  expect(q!.insurerNumber).toBe(e!.insurerNumber);
  expect(q!.insuredCardSymbol).toBe(e!.insuredCardSymbol);
  expect(q!.insuredIdentificationNumber).toBe(e!.insuredIdentificationNumber);
  expect(q!.birthdate).toBe(e!.birthdate);
  expect(q!.limitApplicationCertificateRelatedConsFlg).toBe(e!.limitApplicationCertificateRelatedConsFlg);
  expect(r!.messageBody.processingResultStatus).toBe(d.messageBody.processingResultStatus);
  expect(r!.messageBody.qualificationValidity).toBe(d.messageBody.qualificationValidity);
  const i = r.messageBody.resultList;
  const f = d.messageBody.resultList;
  expect(i.length).toBe(1);
  expect(f.length).toBe(1);
  const j = i[0];
  const g = f[0];
  expect(j.insuredCardClassification).toBe(g.insuredCardClassification);
  expect(j.insurerNumber).toBe(g.insurerNumber);
  expect(j.insuredCardSymbol).toBe(g.insuredCardSymbol);
  expect(j.insuredIdentificationNumber).toBe(g.insuredIdentificationNumber);
  expect(j.insuredBranchNumber).toBe(g.insuredBranchNumber);
  expect(j.personalFamilyClassification).toBe(g.personalFamilyClassification);
  expect(j.name).toBe(g.name);
  expect(j.nameKana).toBe(g.nameKana);
  expect(j.sex1).toBe(g.sex1);
  expect(j.birthdate).toBe(g.birthdate);
  expect(j.address).toBe(g.address);
  expect(j.postNumber).toBe(g.postNumber);
  expect(j.insuredCertificateIssuanceDate).toBe(g.insuredCertificateIssuanceDate);
  expect(j.insuredCardValidDate).toBe(g.insuredCardValidDate);
  expect(j.insurerName).toBe(g.insurerName);
  expect(j.limitApplicationCertificateRelatedConsFlg).toBe(g.limitApplicationCertificateRelatedConsFlg);
  expect(j.limitApplicationCertificateRelatedConsTime).toBe(g.limitApplicationCertificateRelatedConsTime);
  const l = j.limitApplicationCertificateRelatedInfo;
  const h = g.limitApplicationCertificateRelatedInfo;
  expect(l).not.toBeUndefined;
  expect(l?.limitApplicationCertificateClassification).toBe(h.limitApplicationCertificateClassification);
  expect(l?.limitApplicationCertificateClassificationFlag).toBe(h.limitApplicationCertificateClassificationFlag);
  expect(l?.limitApplicationCertificateDate).toBe(h.limitApplicationCertificateDate);
  expect(l?.limitApplicationCertificateValidStartDate).toBe(h.limitApplicationCertificateValidStartDate);
  const elder = j.elderlyRecipientCertificateInfo;
  const elderData = g.elderlyRecipientCertificateInfo;
  expect(elder).not.toBeUndefined;
  expect(elderData).not.toBeUndefined;
  expect(elder?.elderlyRecipientCertificateDate).toBe(elderData.elderlyRecipientCertificateDate);
  expect(elder?.elderlyRecipientValidStartDate).toBe(elderData.elderlyRecipientValidStartDate);
  expect(elder?.elderlyRecipientValidEndDate).toBe(elderData.elderlyRecipientValidEndDate);
  expect(elder?.elderlyRecipientContributionRatio).toBe(elderData.elderlyRecipientContributionRatio);
  expect(elder?.futanWari).toBe(elderData.futanWari);
});

test("loaded koukikourei data", () => {
  const r = OnshiResult.cast(koukikourei);
  const d = koukikoureiData;
  expect(r.messageHeader.processExecutionTime).toBe(d.messageHeader.processExecutionTime);
  expect(r.messageHeader.qualificationConfirmationDate).toBe(d.messageHeader.qualificationConfirmationDate);
  expect(r.messageHeader.medicalInstitutionCode).toBe(d.messageHeader.medicalInstitutionCode);
  expect(r.messageHeader.referenceClassification).toBe(d.messageHeader.referenceClassification);
  expect(r.messageHeader.segmentOfResult).toBe(d.messageHeader.segmentOfResult);
  expect(r.messageHeader.characterCodeIdentifier).toBe(d.messageHeader.characterCodeIdentifier);
  const q = r.messageBody.qualificationConfirmSearchInfo;
  const e = d.messageBody.qualificationConfirmSearchInfo;
  expect(q).not.toBeUndefined;
  expect(e).not.toBeUndefined;
  expect(q!.insurerNumber).toBe(e!.insurerNumber);
  expect(q!.insuredIdentificationNumber).toBe(e!.insuredIdentificationNumber);
  expect(q!.birthdate).toBe(e!.birthdate);
  expect(q!.limitApplicationCertificateRelatedConsFlg).toBe(e!.limitApplicationCertificateRelatedConsFlg);
  expect(r!.messageBody.processingResultStatus).toBe(d.messageBody.processingResultStatus);
  expect(r!.messageBody.qualificationValidity).toBe(d.messageBody.qualificationValidity);
  const i = r.messageBody.resultList;
  const f = d.messageBody.resultList;
  expect(i.length).toBe(1);
  expect(f.length).toBe(1);
  const j = i[0];
  const g = f[0];
  expect(j.insuredCardClassification).toBe(g.insuredCardClassification);
  expect(j.insurerNumber).toBe(g.insurerNumber);
  expect(j.insuredCardSymbol).toBe(g.insuredCardSymbol);
  expect(j.insuredPartialContributionRatio).toBe(g.insuredPartialContributionRatio);
  expect(j.koukikoureiFutanWari).toBe(g.koukikoureiFutanWari);
  expect(j.insuredBranchNumber).toBe(g.insuredBranchNumber);
  expect(j.insuredBranchNumber).toBe(g.insuredBranchNumber);
  expect(j.personalFamilyClassification).toBe(g.personalFamilyClassification);
  expect(j.name).toBe(g.name);
  expect(j.nameKana).toBe(g.nameKana);
  expect(j.sex1).toBe(g.sex1);
  expect(j.birthdate).toBe(g.birthdate);
  expect(j.address).toBe(g.address);
  expect(j.postNumber).toBe(g.postNumber);
  expect(j.insuredCertificateIssuanceDate).toBe(g.insuredCertificateIssuanceDate);
  expect(j.insuredCardValidDate).toBe(g.insuredCardValidDate);
  expect(j.insurerName).toBe(g.insurerName);
  expect(j.limitApplicationCertificateRelatedConsFlg).toBe(g.limitApplicationCertificateRelatedConsFlg);
  expect(j.limitApplicationCertificateRelatedConsTime).toBe(g.limitApplicationCertificateRelatedConsTime);
  const l = j.limitApplicationCertificateRelatedInfo;
  const h = g.limitApplicationCertificateRelatedInfo;
  expect(l).not.toBeUndefined;
  expect(l?.limitApplicationCertificateClassification).toBe(h.limitApplicationCertificateClassification);
  expect(l?.limitApplicationCertificateClassificationFlag).toBe(h.limitApplicationCertificateClassificationFlag);
  expect(l?.limitApplicationCertificateDate).toBe(h.limitApplicationCertificateDate);
  expect(l?.limitApplicationCertificateValidStartDate).toBe(h.limitApplicationCertificateValidStartDate);
});


test("loaded koukikourei data", () => {
  const r = OnshiResult.cast(koukikourei);
  const d = koukikoureiData;
  expect(r.messageHeader.processExecutionTime).toBe(d.messageHeader.processExecutionTime);
  expect(r.messageHeader.qualificationConfirmationDate).toBe(d.messageHeader.qualificationConfirmationDate);
  expect(r.messageHeader.medicalInstitutionCode).toBe(d.messageHeader.medicalInstitutionCode);
  expect(r.messageHeader.referenceClassification).toBe(d.messageHeader.referenceClassification);
  expect(r.messageHeader.segmentOfResult).toBe(d.messageHeader.segmentOfResult);
  expect(r.messageHeader.characterCodeIdentifier).toBe(d.messageHeader.characterCodeIdentifier);
  const q = r.messageBody.qualificationConfirmSearchInfo;
  const e = d.messageBody.qualificationConfirmSearchInfo;
  expect(q).not.toBeUndefined;
  expect(e).not.toBeUndefined;
  expect(q!.insurerNumber).toBe(e!.insurerNumber);
  expect(q!.insuredIdentificationNumber).toBe(e!.insuredIdentificationNumber);
  expect(q!.birthdate).toBe(e!.birthdate);
  expect(q!.limitApplicationCertificateRelatedConsFlg).toBe(e!.limitApplicationCertificateRelatedConsFlg);
  expect(r!.messageBody.processingResultStatus).toBe(d.messageBody.processingResultStatus);
  expect(r!.messageBody.qualificationValidity).toBe(d.messageBody.qualificationValidity);
  const i = r.messageBody.resultList;
  const f = d.messageBody.resultList;
  expect(i.length).toBe(1);
  expect(f.length).toBe(1);
  const j = i[0];
  const g = f[0];
  expect(j.insuredCardClassification).toBe(g.insuredCardClassification);
  expect(j.insurerNumber).toBe(g.insurerNumber);
  expect(j.insuredCardSymbol).toBe(g.insuredCardSymbol);
  expect(j.insuredPartialContributionRatio).toBe(g.insuredPartialContributionRatio);
  expect(j.koukikoureiFutanWari).toBe(g.koukikoureiFutanWari);
  expect(j.insuredBranchNumber).toBe(g.insuredBranchNumber);
  expect(j.insuredBranchNumber).toBe(g.insuredBranchNumber);
  expect(j.personalFamilyClassification).toBe(g.personalFamilyClassification);
  expect(j.name).toBe(g.name);
  expect(j.nameKana).toBe(g.nameKana);
  expect(j.sex1).toBe(g.sex1);
  expect(j.birthdate).toBe(g.birthdate);
  expect(j.address).toBe(g.address);
  expect(j.postNumber).toBe(g.postNumber);
  expect(j.insuredCertificateIssuanceDate).toBe(g.insuredCertificateIssuanceDate);
  expect(j.insuredCardValidDate).toBe(g.insuredCardValidDate);
  expect(j.insurerName).toBe(g.insurerName);
  expect(j.limitApplicationCertificateRelatedConsFlg).toBe(g.limitApplicationCertificateRelatedConsFlg);
  expect(j.limitApplicationCertificateRelatedConsTime).toBe(g.limitApplicationCertificateRelatedConsTime);
  const l = j.limitApplicationCertificateRelatedInfo;
  const h = g.limitApplicationCertificateRelatedInfo;
  expect(l).not.toBeUndefined;
  expect(l?.limitApplicationCertificateClassification).toBe(h.limitApplicationCertificateClassification);
  expect(l?.limitApplicationCertificateClassificationFlag).toBe(h.limitApplicationCertificateClassificationFlag);
  expect(l?.limitApplicationCertificateDate).toBe(h.limitApplicationCertificateDate);
  expect(l?.limitApplicationCertificateValidStartDate).toBe(h.limitApplicationCertificateValidStartDate);
});


