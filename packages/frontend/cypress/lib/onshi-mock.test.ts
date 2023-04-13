import { replaceAll } from "@/lib/util";
import { sexFromLabel } from "onshi-result/codes";
import { describe, it, expect } from "vitest"
import { createOnshiResult, onshiCreationModifier as m } from "./onshi-mock";
import { createPatient } from "./patient";

describe("onshi-mock", () => {
  it("should provide birthdate", () => {
    const result = createOnshiResult(m.result(r => { r.Birthdate = "2000-01-02" }));
    expect(result.messageBody.resultList[0].birthdate).toBe("2000-01-02");
  });

  it("should set patient", () => {
    const patientTmpl = createPatient();
    const result = createOnshiResult(m.patient(patientTmpl));
    expect(result.messageBody.resultList[0].orig.ResultOfQualificationConfirmation.Name).toBe(`${patientTmpl.lastName}　${patientTmpl.firstName}`);
    expect(result.messageBody.resultList[0].orig.ResultOfQualificationConfirmation.NameKana).toBe(`${patientTmpl.lastNameYomi} ${patientTmpl.firstNameYomi}`);
    expect(result.messageBody.resultList[0].orig.ResultOfQualificationConfirmation.Birthdate)
      .toBe(replaceAll(patientTmpl.birthday, "-", ""));
    expect(result.messageBody.resultList[0].orig.ResultOfQualificationConfirmation.Sex1).toBe(sexFromLabel("男"));
  })

});

