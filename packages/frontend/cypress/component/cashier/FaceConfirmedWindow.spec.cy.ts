import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";
import { apiBase } from "@cypress/lib/base";
import { dateToSqlDate, Koukikourei, Patient, Shahokokuho, Visit } from "myclinic-model";
import { enterShahokokuho, getShahokokuho } from "@cypress/lib/shahokokuho";
import { confirmYes, confirmYesContainingMessage } from "@cypress/lib/confirm";
import { koukikoureiOnshiConsistent, shahokokuhoOnshiConsistent } from "@/lib/hoken-onshi-consistent";
import { createKoukikourei, enterKoukikourei, getKoukikourei } from "@cypress/lib/koukikourei";
import { listRecentVisitIdsByPatient } from "@cypress/lib/visit";
import * as kanjidate from "kanjidate";
import type { ResultItem } from "onshi-result/ResultItem";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";

describe("FaceConfirmedWindow", () => {
  it("should mount", () => {
    const result: OnshiResult = createOnshiResult();
    cy.intercept(
      "GET",
      apiBase() + "/search-patient?text=*",
      [10, []]);
    cy.mount(FaceConfirmedWindow, {
      props: {
        destroy: () => { },
        result
      }
    });
  });

  it("should enter new patient", () => {
    const patientTmpl = createPatient({
      lastName: "診療",
      firstName: "大地",
      lastNameYomi: "しんりょう",
      firstNameYomi: "だいち",
      sex: "M",
      birthday: "1960-06-12",
    });
    const result = createOnshiResult(m.patient(patientTmpl), m.shahokokuho(createShahokokuho()));
    console.log(result);
    cy.intercept(
      "GET",
      apiBase() + "/search-patient?text=*",
      [10, []]);
    cy.mount(FaceConfirmedWindow, {
      props: {
        destroy: () => { },
        result
      }
    });
    cy.get("[data-cy=message]").contains("該当患者なし");
    cy.get("button").contains("新規患者登録").click();
    cy.intercept("POST", apiBase() + "/enter-patient").as("enterPatient");
    dialogOpen("新規患者登録").within(() => {
      cy.get("input[data-cy=phone-input]").type("03-1234-5678");
      cy.get("button").contains("入力").click();
    });
    dialogClose("新規患者登録");
    cy.wait("@enterPatient").then(resp => {
      const entered = Patient.cast(resp.response?.body);
      patientTmpl.patientId = entered.patientId;
      patientTmpl.phone = entered.phone;
      expect(entered).deep.equal(patientTmpl);
      cy.wrap(entered.patientId).as("enteredPatientId");
    });
    cy.get<number>("@enteredPatientId").then(enteredPatientId => {
      cy.get("[data-cy=resolved-patient-id]").contains(enteredPatientId.toString());
    });
  });

  it("should select from multiple patients", () => {
    const patientTmpl = createPatient();
    enterPatient(patientTmpl).as("patient1");
    enterPatient(patientTmpl).as("patient2");
    const result = createOnshiResult(m.patient(patientTmpl), m.shahokokuho(createShahokokuho()));
    cy.get<Patient>("@patient1").then(patient1 => {
      cy.get<Patient>("@patient2").then(patient2 => {
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient1, patient2]]);
        cy.mount(FaceConfirmedWindow, {
          props: {
            destroy: () => { },
            result
          }
        });
        cy.get("[data-cy=message]").contains("複数の該当患者");
        cy.get("button").contains("患者選択").click();
        dialogOpen("資格確認患者選択").within(() => {
          cy.get(`[data-patient-id=${patient2.patientId}]`);
          cy.get(`[data-patient-id=${patient1.patientId}]`).within(() => {
            cy.get("button").contains("選択").click();
          });
        });
        dialogClose("資格確認患者選択");
        cy.get("[data-cy=resolved-patient-id]").contains(patient1.patientId.toString());
      });
    });
  }); //

  it.only("should enter new shahokokuho when none available", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      const shahokokuhoTmpl = createShahokokuho({ patientId: patient.patientId });
      const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuhoTmpl));
      expect(result.messageBody.resultList.length).equal(1);
      cy.intercept(
        "GET",
        apiBase() + "/search-patient?text=*",
        [10, [patient]]);
      const props = {
        destroy: () => { },
        result,
        onRegister: () => { }
      };
      cy.mount(FaceConfirmedWindow, { props });
      cy.get("[data-cy=message]").contains("新規保険");
      cy.intercept("POST", apiBase() + "/enter-shahokokuho").as("enterShahokokuho");
      cy.get("button").contains("新規保険証登録").click();
      dialogOpen("新規社保国保登録").within(() => {
        cy.get("button").contains("入力").click();
      });
      cy.wait("@enterShahokokuho").then(resp => {
        const entered = Shahokokuho.cast(resp.response?.body);
        expect(entered).deep.equal(Object.assign({}, shahokokuhoTmpl, { shahokokuhoId: entered.shahokokuhoId}));
      });
      cy.get("button").contains("診察登録").should("exist");
      // confirmYesContainingMessage("登録します");
      // cy.get("[data-cy=message]").should("not.exist");
      // cy.stub(props, "onRegister").as("onRegister");
      // cy.get("button").contains("診察登録").click();
      // cy.get("@onRegister").should("be.called");
      // getMostRecentVisit(patient.patientId).as("visit");
      // cy.get<Visit>("@visit").then((visit: Visit) => {
      //   const shahokokuhoId = visit.shahokokuhoId;
      //   expect(shahokokuhoId).to.be.gt(0);
      //   getShahokokuho(shahokokuhoId).as("shahokokuho");
      // });
      // cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho) => {
      //   console.log("result", result);
      //   expect(isConsistent(shahokokuho, result)).to.be.true;
      // });
    });
  }); //

  it("should enter kourei jukyuu", () => {

  });

  it("should enter new koukikourei when none available", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      const koukikourei = createKoukikourei({ patientId: patient.patientId });
      const result = createOnshiResult(m.patient(patient), m.koukikourei(koukikourei));
      expect(result.messageBody.resultList.length).equal(1);
      cy.intercept(
        "GET",
        apiBase() + "/search-patient?text=*",
        [10, [patient]]);
      const props = {
        destroy: () => { },
        result,
        onRegister: () => { }
      };
      cy.mount(FaceConfirmedWindow, { props });
      cy.get("[data-cy=message]").contains("新しい保険証");
      cy.get("button").contains("新規保険証登録").click();
      confirmYesContainingMessage("登録します");
      cy.get("[data-cy=message]").should("not.exist");
      cy.stub(props, "onRegister").as("onRegister");
      cy.get("button").contains("診察登録").click();
      cy.get("@onRegister").should("be.called");
      getMostRecentVisit(patient.patientId).as("visit");
      cy.get<Visit>("@visit").then((visit: Visit) => {
        const koukikoureiId = visit.koukikoureiId;
        expect(koukikoureiId).to.be.gt(0);
        getKoukikourei(koukikoureiId).as("koukikourei");
      });
      cy.get<Koukikourei>("@koukikourei").then((koukikourei) => {
        expect(isConsistent(koukikourei, result)).to.be.true;
      });
    });
  });

  it("should register patient with valid shahokokuho", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const shahokokuho = createShahokokuho({ patientId: patient.patientId });
      enterShahokokuho(shahokokuho).as("shahokokuho");
    });
    cy.get<Patient>("@patient").then((patient: Patient) => {
      cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho: Shahokokuho) => {
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho))
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        const props = {
          destroy: () => { },
          result,
          onRegister: () => { }
        };
        cy.stub(props, "onRegister").as("onRegister");
        cy.mount(FaceConfirmedWindow, { props });
        cy.get("[data-cy=message]").should("not.exist");
        cy.get("button").contains("診察登録").click();
        cy.get("@onRegister").should("be.called");
        getMostRecentVisit(patient.patientId).as("visit");
        cy.get<Visit>("@visit").then((visit: Visit) => {
          const shahokokuhoId = visit.shahokokuhoId;
          expect(shahokokuhoId).to.be.gt(0);
          getShahokokuho(shahokokuhoId).as("shahokokuho");
        });
        cy.get<Shahokokuho>("@shahokokuho").then((shahokokuho) => {
          expect(isConsistent(shahokokuho, result)).to.be.true;
        });
      });
    });
  });

  it("should register patient with valid koukikourei", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const koukikourei = createKoukikourei({ patientId: patient.patientId });
      enterKoukikourei(koukikourei).as("koukikourei");
    });
    cy.get<Patient>("@patient").then((patient: Patient) => {
      cy.get<Koukikourei>("@koukikourei").then((koukikourei: Koukikourei) => {
        const result = createOnshiResult(m.patient(patient), m.koukikourei(koukikourei))
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        const props = {
          destroy: () => { },
          result,
          onRegister: () => { }
        };
        cy.stub(props, "onRegister").as("onRegister");
        cy.mount(FaceConfirmedWindow, { props });
        cy.get("[data-cy=message]").should("not.exist");
        cy.get("button").contains("診察登録").click();
        cy.get("@onRegister").should("be.called");
        getMostRecentVisit(patient.patientId).as("visit");
        cy.get<Visit>("@visit").then((visit: Visit) => {
          const koukikoureiId = visit.koukikoureiId;
          expect(koukikoureiId).to.be.gt(0);
          getKoukikourei(koukikoureiId).as("koukikourei");
        });
        cy.get<Koukikourei>("@koukikourei").then((koukikourei) => {
          expect(isConsistent(koukikourei, result)).to.be.true;
        });
      });
    });
  });

  it("should renew shahokokuho", () => {
    enterPatient(createPatient()).as("patient");
    const oldHokenshaBangou = 123456;
    const newHokenshaBangou = 1234567;
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const oldShahokokuho = createShahokokuho({
        patientId: patient.patientId,
        hokenshaBangou: oldHokenshaBangou
      });
      enterShahokokuho(oldShahokokuho).as("oldShahokokuho");
    });
    cy.get<Patient>("@patient").then(patient => {
      const newShahokokuho = createShahokokuho({
        patientId: patient.patientId,
        hokenshaBangou: newHokenshaBangou
      });
      const result = createOnshiResult(m.patient(patient), m.shahokokuho(newShahokokuho));
      cy.intercept(
        "GET",
        apiBase() + "/search-patient?text=*",
        [10, [patient]]);
      const props = {
        destroy: () => { },
        result,
        onRegister: () => { }
      };
      cy.mount(FaceConfirmedWindow, { props });
      cy.get("[data-cy=message]").contains("保険者番号が一致しません。");
      cy.get("button").contains("保険証更新").click();
      confirmYes();
      cy.stub(props, "onRegister").as("onRegister");
      cy.get("button").contains("診察登録").click();
      cy.get("@onRegister").should("be.called");
      getMostRecentVisit(patient.patientId).then(visit => {
        const shahokokuhoId = visit.shahokokuhoId;
        expect(shahokokuhoId).to.be.gt(0);
        getShahokokuho(shahokokuhoId).as("newShahokokuho");
      });
      cy.get<Shahokokuho>("@newShahokokuho").then(registered => {
        expect(isConsistent(registered, result)).to.be.true;
      });
      cy.get<Shahokokuho>("@oldShahokokuho").then(oldShahokokuho => {
        getShahokokuho(oldShahokokuho.shahokokuhoId).as("updatedOldShahokokuho");
      });
      cy.get<Shahokokuho>("@updatedOldShahokokuho").then(oldShahokokuho => {
        cy.get<Shahokokuho>("@newShahokokuho").then(newShahokokuho => {
          const prev = kanjidate.addDays(new Date(newShahokokuho.validFrom), -1);
          expect(oldShahokokuho.validUpto).to.be.equal(dateToSqlDate(prev));
        })
      });
    });
  }); //

  it("should renew koukikourei", () => {
    enterPatient(createPatient()).as("patient");
    const oldHihokenshaBangou = "12345678";
    const newHihokenshaBangou = "23456789";
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const oldKoukikourei = createKoukikourei({
        patientId: patient.patientId,
        hihokenshaBangou: oldHihokenshaBangou,
      });
      enterKoukikourei(oldKoukikourei).as("oldKoukikourei");
    });
    cy.get<Patient>("@patient").then(patient => {
      const newKoukikourei = createKoukikourei({
        patientId: patient.patientId,
        hihokenshaBangou: newHihokenshaBangou,
      });
      const result = createOnshiResult(m.patient(patient), m.koukikourei(newKoukikourei));
      cy.intercept(
        "GET",
        apiBase() + "/search-patient?text=*",
        [10, [patient]]);
      const props = {
        destroy: () => { },
        result,
        onRegister: () => { }
      };
      cy.mount(FaceConfirmedWindow, { props });
      cy.get("[data-cy=message]").contains("保険者番号が一致しません。");
      cy.get("button").contains("保険証更新").click();
      confirmYes();
      cy.stub(props, "onRegister").as("onRegister");
      cy.get("button").contains("診察登録").click();
      cy.get("@onRegister").should("be.called");
      getMostRecentVisit(patient.patientId).then(visit => {
        const koukikoureiId = visit.koukikoureiId;
        expect(koukikoureiId).to.be.gt(0);
        getKoukikourei(koukikoureiId).as("newKoukikourei");
      });
      cy.get<Koukikourei>("@newKoukikourei").then(registered => {
        console.log("registered", registered);
        expect(isConsistent(registered, result)).to.be.true;
      })
      cy.get<Koukikourei>("@oldKoukikourei").then(oldKoukikourei => {
        getKoukikourei(oldKoukikourei.koukikoureiId).as("updatedOldKoukikourei");
      });
      cy.get<Koukikourei>("@updatedOldKoukikourei").then(oldKoukikourei => {
        cy.get<Koukikourei>("@newKoukikourei").then(newKoukikourei => {
          const prev = kanjidate.addDays(new Date(newKoukikourei.validFrom), -1);
          expect(oldKoukikourei.validUpto).to.be.equal(dateToSqlDate(prev));
        })
      });
    });
  }); //

  it("should register new patient", () => {
    const patientTmpl = createPatient();
    const shahokokuhoTmpl = createShahokokuho();
    const result = createOnshiResult(m.patient(patientTmpl), m.shahokokuho(shahokokuhoTmpl));
    const props = {
      destroy: () => { },
      result,
      onRegister: () => { }
    };
    cy.stub(props, "onRegister").as("onRegister");
    cy.intercept(
      "GET",
      apiBase() + "/search-patient?text=*",
      [10, []]);
    cy.mount(FaceConfirmedWindow, { props });
    const phone = "03-1234-5678";
    cy.window().then(win => {
      cy.stub(win, "prompt").returns(phone);
    });
    cy.intercept("POST", apiBase() + "/enter-patient").as("enterPatient");
    cy.get("button").contains("新規患者登録").click();
    confirmYes();
    cy.get("@onRegister").should("be.called");
    cy.wait("@enterPatient").then(intercept => {
      const patient = Patient.cast(intercept.response?.body);
      const tmpl = Object.assign({}, patientTmpl, {
        patientId: patient.patientId,
        phone
      });
      expect(patient).deep.equal(tmpl);
      cy.wrap(patient).as("patient");
    });
    cy.get<Patient>("@patient").then(patient => {
      getMostRecentVisit(patient.patientId).as("visit");
    });
    cy.get<Visit>("@visit").then(visit => {
      const shahokokuhoId = visit.shahokokuhoId;
      expect(shahokokuhoId).to.be.gt(0);
      getShahokokuho(shahokokuhoId).as("shahokokuho");
    });
    cy.get<Shahokokuho>("@shahokokuho").then(shahokokuho => {
      cy.get<Patient>("@patient").then(patient => {
        const tmpl = Object.assign({}, shahokokuhoTmpl, {
          shahokokuhoId: shahokokuho.shahokokuhoId,
          patientId: patient.patientId,
        });
        expect(shahokokuho).deep.equal(tmpl);
      })
    })
  }); //

});

function getMostRecentVisit(patientId: number): Cypress.Chainable<Visit> {
  return listRecentVisitIdsByPatient(patientId, 1).then(visitIds => {
    expect(visitIds.length).equal(1);
    const visitId = visitIds[0];
    return cy.request(
      apiBase() + `/get-visit?visit-id=${visitId}`
    ).its("body").then((body) => Visit.cast(body));
  });
}

function isConsistent(hoken: Shahokokuho | Koukikourei, result: OnshiResult): boolean {
  const r: ResultItem = result.messageBody.resultList[0];
  if (hoken instanceof Shahokokuho) {
    return shahokokuhoOnshiConsistent(hoken, r) === undefined;
  } else {
    return koukikoureiOnshiConsistent(hoken, r) === undefined;
  }
}

