import { OnshiResult } from "onshi-result";
import { parseFaceXml } from "./onshi-face";
import { describe, expect, it } from "vitest";

describe("onshi-face", () => {
  it("should run", () => {
    const xml = getXml();
    const result = parseFaceXml(xml);
    expect(result instanceof OnshiResult).to.be.true;
  });

  it("should parse name yomi", () => {
    const xml = getXml({ NameKana: "ｽｽﾞｷ ｴﾐｺ"});
    const result = parseFaceXml(xml);
    expect(result.messageBody.nameKana).to.be.equal("ｽｽﾞｷ ｴﾐｺ")
  })
});

export { };

interface XmlSpec {
  NameKana?: string;
}

function getXml(spec: XmlSpec = {}): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<XmlMsg>
    <MessageHeader>
        <ProcessExecutionTime>20230221174835</ProcessExecutionTime>
        <CharacterCodeIdentifier>0</CharacterCodeIdentifier>
        <SegmentOfResult>1</SegmentOfResult>
        <QualificationConfirmationDate>20230221</QualificationConfirmationDate>
        <ReferenceClassification>1</ReferenceClassification>
        <ArbitraryFileIdentifier>ArnHCeDfNjMCFzg=</ArbitraryFileIdentifier>
        <MedicalInstitutionCode>1311111111</MedicalInstitutionCode>
    </MessageHeader>
    <MessageBody>
        <ResultList>
            <ResultOfQualificationConfirmation>
                <Address>東京都</Address>
                <SpecificHealthCheckupsInfoConsTime>20230221174835</SpecificHealthCheckupsInfoConsTime>
                <DiagnosisInfoConsFlg>0</DiagnosisInfoConsFlg>
                <SpecificHealthCheckupsInfoAvailableTime>20230222174835</SpecificHealthCheckupsInfoAvailableTime>
                <PersonalFamilyClassification>1</PersonalFamilyClassification>
                <Sex1>1</Sex1>
                <SpecificDiseasesCertificateRelatedConsFlg>0</SpecificDiseasesCertificateRelatedConsFlg>
                <Name>診療　太郎</Name>
                <InsurerNumber>  123456</InsurerNumber>
                <InsuredCardSymbol>12-34</InsuredCardSymbol>
                <NameKana>${spec.NameKana ?? "ｼﾝﾘｮｳ ﾀﾛｳ"}</NameKana>
                <InsuredCardValidDate>20191001</InsuredCardValidDate>
                <LimitApplicationCertificateRelatedConsFlg>0</LimitApplicationCertificateRelatedConsFlg>
                <InsuredCardClassification>01</InsuredCardClassification>
                <InsuredBranchNumber>01</InsuredBranchNumber>
                <Birthdate>20010327</Birthdate>
                <InsuredCertificateIssuanceDate>20191001</InsuredCertificateIssuanceDate>
                <InsuredIdentificationNumber>4260</InsuredIdentificationNumber>
                <PharmacistsInfoAvailableTime>20230222174835</PharmacistsInfoAvailableTime>
                <SpecificHealthCheckupsInfoConsFlg>1</SpecificHealthCheckupsInfoConsFlg>
                <PharmacistsInfoConsTime>20230221174835</PharmacistsInfoConsTime>
                <PharmacistsInfoConsFlg>1</PharmacistsInfoConsFlg>
                <InsurerName>東京都</InsurerName>
                <PostNumber>123-4567</PostNumber>
            </ResultOfQualificationConfirmation>
        </ResultList>
        <ProcessingResultStatus>1</ProcessingResultStatus>
        <QualificationValidity>1</QualificationValidity>
    </MessageBody>
</XmlMsg>`;
}