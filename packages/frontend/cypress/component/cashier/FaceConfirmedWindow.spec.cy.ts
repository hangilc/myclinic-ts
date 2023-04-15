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
import { listRecentVisitIdsByPatient, startVisit } from "@cypress/lib/visit";
import * as kanjidate from "kanjidate";
import type { ResultItem } from "onshi-result/ResultItem";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { KouhiDialogDriver } from "@cypress/lib/kouhi-dialog";

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

  it("should enter new shahokokuho when none available", () => {
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
        expect(entered).deep.equal(Object.assign({}, shahokokuhoTmpl, { shahokokuhoId: entered.shahokokuhoId }));
      });
      cy.get("button").contains("診察登録").should("exist");
    });
  }); //

  it("should enter kourei jukyuu", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      const shahokokuhoTmpl = createShahokokuho({ patientId: patient.patientId, koureiStore: 2 });
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
        expect(entered).deep.equal(Object.assign({}, shahokokuhoTmpl, { shahokokuhoId: entered.shahokokuhoId }));
      });
      cy.get("button").contains("診察登録").should("exist");
    });
  });

  it("should enter new koukikourei when none available", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient) => {
      const koukikoureiTmpl = createKoukikourei({ patientId: patient.patientId });
      const result = createOnshiResult(m.patient(patient), m.koukikourei(koukikoureiTmpl));
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
      cy.intercept("POST", apiBase() + "/enter-koukikourei").as("enterKoukikourei");
      cy.get("[data-cy=message]").contains("新規保険");
      cy.get("button").contains("新規保険証登録").click();
      dialogOpen("新規後期高齢保険登録").within(() => {
        cy.get("button").contains("入力").click();
      });
      dialogClose("新規後期高齢保険登録");
      cy.wait("@enterKoukikourei").then(resp => {
        const entered = Koukikourei.cast(resp.response?.body);
        expect(entered).deep.equal(Object.assign({}, koukikoureiTmpl, { koukikoureiId: entered.koukikoureiId }));
      });
      cy.get("button").contains("診察登録").should("exist");
    });
  });

  it("should fix valid upto of current shahokokuho in regular case", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      enterShahokokuho(createShahokokuho({
        patientId: patient.patientId,
        hokenshaBangou: 32123434,
        validFrom: "2022-06-01",
        validUpto: "0000-00-00",
      })).as("curHoken");
      cy.get<Shahokokuho>("@curHoken").then((curHoken: Shahokokuho) => {
        const newHokenTmpl = createShahokokuho({
          patientId: patient.patientId,
          hokenshaBangou: 32132411,
          validFrom: "2023-04-14",
          validUpto: "0000-00-00",
        });
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(newHokenTmpl));
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        cy.intercept("GET", apiBase() + "/find-available-shahokokuho?*").as("findShahokokuho");
        cy.intercept("POST", apiBase() + "/update-shahokokuho").as("updateShahokokuho");
        const props = {
          destroy: () => { },
          result,
          onRegister: () => { }
        };
        cy.mount(FaceConfirmedWindow, { props });
        cy.wait("@findShahokokuho").then(resp => {
          const body = resp.response!.body;
          expect(body).deep.equal(curHoken);
        });
        cy.get("button").contains("新規保険証登録").click();
        dialogOpen("新規社保国保登録").within(() => cy.get("button").contains("入力").click());
        dialogClose("新規社保国保登録");
        cy.wait("@updateShahokokuho").then(resp => {
          const body = JSON.parse(resp.request.body);
          expect(body).deep.equal(Object.assign({}, curHoken, {
            validUpto: "2023-04-13",
          }))
        });
        cy.get("button").contains("診察登録").should("exist");
      });
    })
  })

  it("should fix valid upto of current koukikourei in regular case", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      enterKoukikourei(createKoukikourei({
        patientId: patient.patientId,
        hokenshaBangou: "39123434",
        validFrom: "2022-10-01",
        validUpto: "2100-09-30",
      })).as("curHoken");
      cy.get<Shahokokuho>("@curHoken").then((curHoken: Shahokokuho) => {
        const newHokenTmpl = createKoukikourei({
          patientId: patient.patientId,
          hokenshaBangou: "39132424",
          validFrom: "2023-04-14",
          validUpto: "0000-00-00",
        });
        const result = createOnshiResult(m.patient(patient), m.koukikourei(newHokenTmpl));
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        cy.intercept("GET", apiBase() + "/find-available-koukikourei?*").as("findKoukikourei");
        cy.intercept("POST", apiBase() + "/update-koukikourei").as("updateKoukikourei");
        const props = {
          destroy: () => { },
          result,
          onRegister: () => { }
        };
        cy.mount(FaceConfirmedWindow, { props });
        cy.wait("@findKoukikourei").then(resp => {
          const body = resp.response!.body;
          expect(body).deep.equal(curHoken);
        });
        cy.get("button").contains("新規保険証登録").click();
        dialogOpen("新規後期高齢保険登録").within(() => cy.get("button").contains("入力").click());
        dialogClose("新規後期高齢保険登録");
        cy.wait("@updateKoukikourei").then(resp => {
          const body = JSON.parse(resp.request.body);
          expect(body).deep.equal(Object.assign({}, curHoken, {
            validUpto: "2023-04-13",
          }))
        });
        cy.get("button").contains("診察登録").should("exist");
      });
    })
  });

  it("should handle current shahokokuho in conflict case", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterShahokokuho(createShahokokuho({
        patientId: patient.patientId,
        hokenshaBangou: 6123456,
        hihokenshaBangou: "1234",
        validFrom: "2022-03-01",
        validUpto: "0000-00-00",
      })).as("curShahokokuho");
    });
    cy.get<Shahokokuho>("@curShahokokuho").then(curShahokokuho => {
      startVisit(curShahokokuho.patientId, "2023-04-01 09:20:00").then(visit => {
        expect(visit.shahokokuhoId).to.be.equal(curShahokokuho.shahokokuhoId);
      }).as("visit")
    });
    cy.get<Patient>("@patient").then(patient => {
      const newShahokokuho = createShahokokuho({
        patientId: patient.patientId,
        hokenshaBangou: 6123456,
        hihokenshaBangou: "2211",
        validFrom: "2023-02-01",
        validUpto: "0000-00-00",
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
      cy.get("[data-cy=message]").contains("可能であれば有効期限終了を設定します。");
      cy.get("button").contains("新規保険証登録").click();
      cy.intercept("GET", apiBase() + "/shahokokuho-usage-since*").as("usageSince");
      cy.on("window:alert", (t) => {
        expect(t).contains("失効している保険証");
        expect(t).contains("管理者に連絡してください");
      });
      cy.intercept("POST", apiBase() + "/update-shahokokuho", cy.spy().as("updateShahokokuho"));
      dialogOpen("新規社保国保登録").within(() => cy.get("button").contains("入力").click());
      dialogClose("新規社保国保登録");
      cy.get<Visit>("@visit").then(visit => {
        cy.wait("@usageSince").then(resp => {
          const body = resp.response!.body;
          expect(body).deep.equal([visit]);
        });
      });
      cy.get("@updateShahokokuho").should("not.be.called");
      cy.get("button").contains("診察登録").should("exist");
    });
  });

  it("should handle current koukikourei in conflict case", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterKoukikourei(createKoukikourei({
        patientId: patient.patientId,
        hokenshaBangou: "39132424",
        hihokenshaBangou: "12345678",
        validFrom: "2022-03-01",
        validUpto: "0000-00-00",
      })).as("curKoukikourei");
    });
    cy.get<Koukikourei>("@curKoukikourei").then(curKoukikourei => {
      startVisit(curKoukikourei.patientId, "2023-04-01 09:20:00").then(visit => {
        expect(visit.koukikoureiId).to.be.equal(curKoukikourei.koukikoureiId);
      }).as("visit")
    });
    cy.get<Patient>("@patient").then(patient => {
      const newKoukikourei = createKoukikourei({
        patientId: patient.patientId,
        hokenshaBangou: "39132424",
        hihokenshaBangou: "99345678",
        validFrom: "2023-02-01",
        validUpto: "0000-00-00",
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
      cy.get("[data-cy=message]").contains("可能であれば有効期限終了を設定します。");
      cy.get("button").contains("新規保険証登録").click();
      cy.intercept("GET", apiBase() + "/koukikourei-usage-since*").as("usageSince");
      cy.on("window:alert", (t) => {
        expect(t).contains("失効している保険証");
        expect(t).contains("管理者に連絡してください");
      });
      cy.intercept("POST", apiBase() + "/update-koukikourei", cy.spy().as("updateKoukikourei"));
      dialogOpen("新規後期高齢保険登録").within(() => cy.get("button").contains("入力").click());
      dialogClose("新規後期高齢保険登録");
      cy.get<Visit>("@visit").then(visit => {
        cy.wait("@usageSince").then(resp => {
          const body = resp.response!.body;
          expect(body).deep.equal([visit]);
        });
      });
      cy.get("@updateKoukikourei").should("not.be.called");
      cy.get("button").contains("診察登録").should("exist");
    });
  });

  it.only("should enter kouhi", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterShahokokuho(createShahokokuho({ patientId: patient.patientId })).as("shahokokuho");
    });
    cy.get<Patient>("@patient").then(patient => {
      cy.get<Shahokokuho>("@shahokokuho").then(shahokokuho => {
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho));
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
        cy.get("a").contains("公費入力").click();
        dialogOpen("公費入力").within(() => {
          const drv = new KouhiDialogDriver();
          drv.setFutansha("13123456");
          drv.setJukyuusha("12345678");
          drv.setValidFrom("2023-04-01");
          drv.setValidUpto("2024-03-31");
        });
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

