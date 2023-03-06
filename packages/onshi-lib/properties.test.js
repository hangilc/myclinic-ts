const { onshiValidity } = require("./properties");

const json = JSON.parse(`
{
  "XmlMsg": {
    "MessageHeader": {
      "ProcessExecutionTime": "20230306145023",
      "QualificationConfirmationDate": "20230304",
      "MedicalInstitutionCode": "1311111111",
      "ReferenceClassification": "2",
      "SegmentOfResult": "1",
      "CharacterCodeIdentifier": "0"
    },
    "MessageBody": {
      "QualificationConfirmSearchInfo": {
        "InsurerNumber": "01234567",
        "InsuredCardSymbol": "1234",
        "InsuredIdentificationNumber": "1987654",
        "Birthdate": "20000102",
        "LimitApplicationCertificateRelatedConsFlg": "1"
      },
      "ProcessingResultStatus": "1",
      "QualificationValidity": "1",
      "ResultList": [
        {
          "ResultOfQualificationConfirmation": {
            "InsuredCardClassification": "01",
            "InsurerNumber": "01234567",
            "InsuredCardSymbol": "1234",
            "InsuredIdentificationNumber": "1987654",
            "InsuredBranchNumber": "01",
            "PersonalFamilyClassification": "1",
            "Name": "診療　太郎",
            "NameKana": "ｼﾝﾘｮｳ ﾀﾛｳ",
            "Sex1": "1",
            "Birthdate": "20000102",
            "Address": "東京都",
            "PostNumber": "123-4567",
            "InsuredCertificateIssuanceDate": "20190401",
            "InsuredCardValidDate": "20190401",
            "InsurerName": "保険組合",
            "LimitApplicationCertificateRelatedConsFlg": "1",
            "LimitApplicationCertificateRelatedConsTime": "20230306145023",
            "LimitApplicationCertificateRelatedInfo": {
              "LimitApplicationCertificateClassification": "01",
              "LimitApplicationCertificateClassificationFlag": "A03",
              "LimitApplicationCertificateDate": "20220901",
              "LimitApplicationCertificateValidStartDate": "20220901"
            }
          }
        }
      ]
    }
  }
}
`);

test("It should return validity", () => {
  expect(onshiValidity(json)).toBe("1");
});
