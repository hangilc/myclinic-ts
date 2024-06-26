import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { createOnshiResult } from "@cypress/lib/onshi-mock";
import { createPatient, enterPatient, type PatientCreationSpec } from "@cypress/lib/patient";
import { createShahokokuho } from "@cypress/lib/shahokokuho-mock";
import type { OnshiResult } from "onshi-result";
import { onshiCreationModifier as m } from "@cypress/lib/onshi-mock";
import { apiBase } from "@cypress/lib/base";
import { dateToSqlDate, Kouhi, Koukikourei, Patient, Shahokokuho, Visit } from "myclinic-model";
import { enterShahokokuho, getShahokokuho, shahokokuhoUsage } from "@cypress/lib/shahokokuho";
import { createKoukikourei, enterKoukikourei, getKoukikourei, koukikoureiUsage } from "@cypress/lib/koukikourei";
import { endVisit, getVisit, startVisit } from "@cypress/lib/visit";
import * as kanjidate from "kanjidate";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { KouhiDialogDriver } from "@cypress/lib/kouhi-dialog";
import { createKouhi, enterKouhi } from "@cypress/lib/kouhi";
import { incMonth } from "@/lib/date-util";

describe("FaceConfirmedWindow", { defaultCommandTimeout: 30000 }, () => {
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
  });

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
      cy.intercept("POST", apiBase() + "/enter-shahokokuho").as("enterShahokokuho");
      cy.get("button").contains("新規社保国保登録").click();
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
      cy.intercept("POST", apiBase() + "/enter-shahokokuho").as("enterShahokokuho");
      cy.get("button").contains("新規社保国保登録").click();
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
      cy.get("button").contains("新規後期高齢登録").click();
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

  it("should automatically update edaban when it was empty", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const hokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: 32123434,
        edaban: "",
        validFrom: "2022-06-01",
        validUpto: "0000-00-00",
      };
      enterShahokokuho(createShahokokuho(hokenTmpl)).as("curHoken");
      cy.get<Shahokokuho>("@curHoken").then((curHoken: Shahokokuho) => {
        const newHokenTmpl = Object.assign({}, hokenTmpl, { edaban: "01" });
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(createShahokokuho(newHokenTmpl)));
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
        cy.wait("@updateShahokokuho").then(resp => {
          const body = JSON.parse(resp.request.body);
          expect(body).deep.equal(Object.assign({}, curHoken, {
            edaban: "01",
          }))
        });
        cy.get("button").contains("診察登録").should("exist");
      });
    })
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
        cy.get("button").contains("新規社保国保登録").click();
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
      cy.get<Koukikourei>("@curHoken").then((curHoken: Koukikourei) => {
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
        cy.get("button").contains("新規後期高齢登録").click();
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

  it("should handle shahokokuho new kourei conflict", () => {
    enterPatient(createPatient({})).then((patient: Patient) => {
      const hokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: 123456,
        validFrom: "2023-04-14",
        validUpto: "2025-04-13",
      }
      enterShahokokuho(createShahokokuho(Object.assign({}, hokenTmpl, {
        kourei: 0
      }))).then((curHoken: Shahokokuho) => {
        const newHoken = createShahokokuho(Object.assign({}, hokenTmpl, {
          validFrom: "2024-04-14",
          koureiStore: 2
        }));
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(newHoken));
        console.log("result", result);
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
        cy.get("button").contains("新規社保国保登録").click();
        dialogOpen("新規社保国保登録").within(() => {
          cy.get("button").contains("入力").click();
        });
        dialogClose("新規後期高齢保険登録");
        cy.wait("@updateShahokokuho").then(resp => {
          const body = JSON.parse(resp.request.body);
          console.log("body", body);
          expect(body).deep.equal(Object.assign({}, curHoken, {
            validUpto: "2024-04-13",
          }))
        });
        cy.get("button").contains("診察登録").should("exist");
      });
    });
  });

  it("should handle koukikourei futanwari conflict", () => {
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then((patient: Patient) => {
      const hokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: "39123434",
        validFrom: "2022-10-01",
        validUpto: "2100-09-30",
      };
      enterKoukikourei(createKoukikourei(Object.assign({}, hokenTmpl, {
        futanWari: 2,
      }))).as("curHoken");
      cy.get<Koukikourei>("@curHoken").then((curHoken: Koukikourei) => {
        const newHokenTmpl = createKoukikourei(Object.assign({}, hokenTmpl, {
          futanWari: 3,
        }));
        const result = createOnshiResult(m.patient(patient), m.koukikourei(newHokenTmpl));
        cy.intercept(
          "GET",
          apiBase() + "/search-patient?text=*",
          [10, [patient]]);
        cy.intercept("GET", apiBase() + "/find-available-koukikourei?*").as("findKoukikourei");
        // cy.intercept("POST", apiBase() + "/update-koukikourei").as("updateKoukikourei");
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
        cy.get("button").contains("新規後期高齢登録").click();
        dialogOpen("新規後期高齢保険登録").within(() => {
          cy.get("button").contains("入力").click();
        });
        dialogClose("新規後期高齢保険登録");
        // cy.wait("@updateKoukikourei").then(resp => {
        //   const body = JSON.parse(resp.request.body);
        //   console.log("body", body);
        //   expect(body).deep.equal(Object.assign({}, curHoken, {
        //     validUpto: "2022-09-30",
        //   }))
        // });
        cy.get("div.error").should("exist").should("not.be.empty");
        cy.get("button").contains("診察登録").should("exist");
      });
    });
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
      cy.get("button").contains("新規社保国保登録").click();
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

  it("should handle current koukikourei in conflict", () => {
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
      cy.get("button").contains("新規後期高齢登録").click();
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

  it("should enter kouhi", () => {
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
        cy.intercept("POST", apiBase() + "/enter-kouhi").as("enterKouhi");
        dialogOpen("公費登録").within(() => {
          const drv = new KouhiDialogDriver();
          drv.setFutansha("13123456");
          drv.setJukyuusha("12345678");
          drv.setValidFrom("2023-04-01");
          // drv.setValidUpto("2024-03-31");
          drv.setValidUpto(dateToSqlDate(incMonth(new Date(), 1))),
          drv.enter();
        });
        dialogClose("公費登録");
        cy.wait("@enterKouhi").then(resp => {
          const body = resp.response?.body;
          const kouhiId = body.kouhiId;
          cy.get(`[data-kouhi-id=${kouhiId}]`).should("exist");
        })
      })
    })
  });

  it("should start visit", () => {
    const prevDate = dateToSqlDate(kanjidate.addMonths(new Date(), -2));
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterShahokokuho(createShahokokuho({
        patientId: patient.patientId,
        validFrom: prevDate,
        validUpto: "0000-00-00",
      })).as("shahokokuho");
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
          onRegister: (entered: Visit) => {
            cy.wrap({}).then(() => {

              getVisit(entered.visitId).then(visit => {
                expect(visit.patientId).to.be.equal(patient.patientId);
                expect(visit.shahokokuhoId).to.be.equal(shahokokuho.shahokokuhoId);
              });
            })
          }
        };
        cy.stub(props, "onRegister").as("onRegister");
        cy.mount(FaceConfirmedWindow, { props });
        cy.get("button").contains("診察登録").click();
        cy.get("@onRegister").should("be.called");
      })
    })
  });

  it("should start visit with kouhi", () => {
    const prevDate = dateToSqlDate(kanjidate.addMonths(new Date(), -2));
    enterPatient(createPatient()).as("patient");
    cy.get<Patient>("@patient").then(patient => {
      enterShahokokuho(createShahokokuho({
        patientId: patient.patientId,
        validFrom: prevDate,
        validUpto: "0000-00-00",
      })).as("shahokokuho");
      enterKouhi(createKouhi({
        patientId: patient.patientId,
        validFrom: prevDate,
        validUpto: "0000-00-00",
      })).as("kouhi");
    });
    cy.get<Patient>("@patient").then(patient => {
      cy.get<Shahokokuho>("@shahokokuho").then(shahokokuho => {
        cy.get<Kouhi>("@kouhi").then(_kouhi => {
          const result = createOnshiResult(m.patient(patient), m.shahokokuho(shahokokuho));
          cy.intercept(
            "GET",
            apiBase() + "/search-patient?text=*",
            [10, [patient]]);
          const props = {
            destroy: () => { },
            result,
            onRegister: (_entered: Visit) => { }
          };
          cy.spy(props, "onRegister").as("onRegister");
          cy.mount(FaceConfirmedWindow, { props });
          cy.intercept("POST", apiBase() + "/set-onshi").as("setOnshi");
          cy.get("button").contains("診察登録").click();
          cy.get("@onRegister").should("be.calledOnce");
          cy.get("@onRegister").then((spy: any) => {
            const args = spy.firstCall.args;
            expect(args.length).to.be.equal(1);
            const visit = Visit.cast(args[0]);
            expect(visit.patientId).to.be.equal(patient.patientId);
            expect(visit.shahokokuhoId).to.be.equal(shahokokuho.shahokokuhoId);
            cy.wrap(visit).as("visit");
          });
          cy.wait("@setOnshi").then(resp => {
            cy.get<Visit>("@visit").then(visit => {
              const body = JSON.parse(resp.request.body);
              expect(body.visitId).to.be.equal(visit.visitId);
              expect(JSON.parse(body.kakunin)).deep.equal(JSON.parse(JSON.stringify(result.toJSON())));
            })
          });
        })
      })
    })
  });

  it("should choose from existing patient", () => {
    const patientTmpl = createPatient({
      patientId: 100,
      lastName: "髙橋",
      firstName: "大地",
      lastNameYomi: "たかはし",
      firstNameYomi: "だいち",
      sex: "M",
      birthday: "1960-06-12",
      address: "東京",
      phone: "03"
    });
    const result = createOnshiResult(m.patient(Object.assign({}, patientTmpl, {
      lastName: "●橋",
    })), m.shahokokuho(createShahokokuho()));
    cy.intercept(
      "GET",
      apiBase() + "/search-patient?text=*",
      (req) => {
        if (req.query.text === "大地" || req.query.text === "●橋　大地") {
          req.reply([10, [patientTmpl]])
        } else {
          req.reply([10, []])
        }
      }
    );
    cy.mount(FaceConfirmedWindow, {
      props: {
        destroy: () => { },
        result
      }
    });
    cy.get("button").contains("既存患者検索").click();
    cy.intercept(
      "POST",
      apiBase() + "/update-patient",
      (req) => {
        const memo = JSON.parse(JSON.parse(req.body).memo);
        expect(memo["onshi-name"]).equal("●橋　大地");
        req.reply("true");
      }
    ).as("updatePatient");
    cy.intercept(
      "GET",
      apiBase() + "/get-patient?*",
      (req) => {
        if (req.query["patient-id"] === "100") {
          req.reply(patientTmpl);
        }
      }
    );
    dialogOpen("患者検索").within(() => {
      cy.get('input[type=text]').should("have.value", "●橋　大地");
      cy.get("input").clear().type("大地");
      cy.get("button").contains("検索").click();
      cy.get(`div.patient-wrapper[data-patient-id="100"] button`).click();
    });
    dialogClose("患者検索");
    dialogOpen("患者確認").within(() => {
      cy.get("button").contains("患者決定").click();
    });
    dialogClose("患者確認");
    cy.wait("@updatePatient");
    cy.get('[data-cy="resolved-patient-id"]').should("exist");
    cy.get("button").contains("既存患者検索").should("not.exist");
  });

  it("should update validUpto of Shahokokuho", () => {
    const hokenshaBangou1 = 12345678;
    const hokenshaBangou2 = 22222222;
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: hokenshaBangou1,
        validFrom: "2023-02-13",
        validUpto: "0000-00-00",
      }
      enterShahokokuho(createShahokokuho(oldHokenTmpl)).then((oldHoken: Shahokokuho) => {
        console.log("oldShahokokuho", oldHoken);
        startVisit(patient.patientId, "2023-05-01 14:00:00").then((oldVisit: Visit) => {
          console.log("oldVisit", oldVisit);
          endVisit(oldVisit.visitId, 0).then(() => {
            shahokokuhoUsage(oldHoken.shahokokuhoId).then(visits => {
              expect(visits.length).equals(1);
              expect(visits[0].shahokokuhoId).equals(oldHoken.shahokokuhoId);
            });
            const newHoken = createShahokokuho(Object.assign({}, oldHokenTmpl, {
              validFrom: "2024-04-14",
              hokenshaBangou: hokenshaBangou2,
            }));
            const result = createOnshiResult(m.patient(patient), m.shahokokuho(newHoken));
            console.log("result", result);
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
            cy.get("button").contains("新規社保国保登録").click();
            dialogOpen("新規社保国保登録").within(() => {
              cy.get("button").contains("入力").click();
            })
            dialogClose("新規社保国保登録");
            cy.get("button").contains("診察登録");
            getShahokokuho(oldHoken.shahokokuhoId).then(updated => {
              const expectedValidUpto = dateToSqlDate(kanjidate.addDays(new Date(newHoken.validFrom), -1));
              expect(updated.validUpto).equals(expectedValidUpto);
            })
          });
        })
      });
    })
  });

  it("should not update validUpto of Shahokokuho", () => {
    const hokenshaBangou1 = 12345678;
    const hokenshaBangou2 = 11111111;
    const visitedAt = `${dateToSqlDate(incMonth(new Date(), +1))} 14:00:00`;
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: hokenshaBangou1,
        validFrom: "2023-02-13",
        validUpto: "0000-00-00",
      }
      enterShahokokuho(createShahokokuho(oldHokenTmpl)).then((oldHoken: Shahokokuho) => {
        startVisit(patient.patientId, visitedAt).then((oldVisit: Visit) => {
          endVisit(oldVisit.visitId, 0).then(() => {
            shahokokuhoUsage(oldHoken.shahokokuhoId).then(visits => {
              expect(visits.length).equals(1);
              expect(visits[0].shahokokuhoId).equals(oldHoken.shahokokuhoId);
            });
            const newHoken = createShahokokuho(Object.assign({}, oldHokenTmpl, {
              validFrom: "2024-04-14",
              hokenshaBangou: hokenshaBangou2,
            }));
            const result = createOnshiResult(m.patient(patient), m.shahokokuho(newHoken));
            console.log("result", result);
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
            cy.get("button").contains("新規社保国保登録").click();
            dialogOpen("新規社保国保登録").within(() => {
              cy.get("button").contains("入力").click();
            })
            dialogClose("新規社保国保登録");
            cy.get("button").contains("診察登録");
            getShahokokuho(oldHoken.shahokokuhoId).then(updated => {
              expect(updated.validUpto).equals("0000-00-00");
            })
          });
        })
      });
    })
  });

  it("should update validUpto of koukikourei", () => {
    const hokenshaBangou1 = "39123456";
    const hokenshaBangou2 = "39111111";
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: hokenshaBangou1,
        validFrom: "2023-02-13",
        validUpto: "0000-00-00",
      }
      enterKoukikourei(createKoukikourei(oldHokenTmpl)).then((oldHoken: Koukikourei) => {
        console.log("oldKoukikourei", oldHoken);
        startVisit(patient.patientId, "2023-05-01 14:00:00").then((oldVisit: Visit) => {
          console.log("oldVisit", oldVisit);
          endVisit(oldVisit.visitId, 0).then(() => {
            koukikoureiUsage(oldHoken.koukikoureiId).then(visits => {
              expect(visits.length).equals(1);
              expect(visits[0].koukikoureiId).equals(oldHoken.koukikoureiId);
            });
            const newHoken = createKoukikourei(Object.assign({}, oldHokenTmpl, {
              validFrom: "2024-04-14",
              hokenshaBangou: hokenshaBangou2,
            }));
            const result = createOnshiResult(m.patient(patient), m.koukikourei(newHoken));
            console.log("result", result);
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
            cy.get("button").contains("新規後期高齢登録").click();
            dialogOpen("新規後期高齢保険登録").within(() => {
              cy.get("button").contains("入力").click();
            })
            dialogClose("新規後期高齢保険登録");
            cy.get("button").contains("診察登録");
            getKoukikourei(oldHoken.koukikoureiId).then(updated => {
              const expectedValidUpto = dateToSqlDate(kanjidate.addDays(new Date(newHoken.validFrom), -1));
              expect(updated.validUpto).equals(expectedValidUpto);
            })
          });
        })
      });
    })
  });

  it("should not update validUpto of Koukikourei", () => {
    const hokenshaBangou1 = "39123456";
    const hokenshaBangou2 = "39111111";
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        hokenshaBangou: hokenshaBangou1,
        validFrom: "2023-02-13",
        validUpto: "0000-00-00",
      }
      enterKoukikourei(createKoukikourei(oldHokenTmpl)).then((oldHoken: Koukikourei) => {
        console.log("oldKoukikourei", oldHoken);
        startVisit(patient.patientId, "2024-05-01 14:00:00").then((oldVisit: Visit) => {
          console.log("oldVisit", oldVisit);
          endVisit(oldVisit.visitId, 0).then(() => {
            koukikoureiUsage(oldHoken.koukikoureiId).then(visits => {
              expect(visits.length).equals(1);
              expect(visits[0].koukikoureiId).equals(oldHoken.koukikoureiId);
            });
            const newHoken = createKoukikourei(Object.assign({}, oldHokenTmpl, {
              validFrom: "2024-04-14",
              hokenshaBangou: hokenshaBangou2,
            }));
            const result = createOnshiResult(m.patient(patient), m.koukikourei(newHoken));
            console.log("result", result);
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
            cy.get("button").contains("新規後期高齢登録").click();
            dialogOpen("新規後期高齢保険登録").within(() => {
              cy.get("button").contains("入力").click();
            })
            dialogClose("新規後期高齢保険登録");
            cy.get("button").contains("診察登録");
            getKoukikourei(oldHoken.koukikoureiId).then(updated => {
              expect(updated.validUpto).equals("0000-00-00");
            })
          });
        })
      });
    })
  });

  it("should assert same validUpto in Shahokokuho", () => {
    const validUpto = dateToSqlDate(incMonth(new Date(), 1));
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        validFrom: "2023-02-13",
        validUpto: validUpto,
      }
      enterShahokokuho(createShahokokuho(oldHokenTmpl)).then((oldHoken: Shahokokuho) => {
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(oldHoken));
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
        cy.get("button").contains("診察登録").should("exist");
      });
    })
  });

  it("should assert same validUpto in Koukikourei", () => {
    const validUpto = dateToSqlDate(incMonth(new Date(), 1));
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        validFrom: "2023-02-13",
        validUpto: validUpto,
      }
      enterKoukikourei(createKoukikourei(oldHokenTmpl)).then((oldHoken: Koukikourei) => {
        const result = createOnshiResult(m.patient(patient), m.koukikourei(oldHoken));
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
        cy.get("button").contains("診察登録").should("exist");
      });
    })
  });

  it("should handle edaban fix", () => {
    enterPatient(createPatient()).then((patient: Patient) => {
      const oldHokenTmpl = {
        patientId: patient.patientId,
        validFrom: "2023-02-13",
        validUpto: "2024-02-12",
        edaban: "",
      };
      enterShahokokuho(createShahokokuho(oldHokenTmpl)).then((hoken: Shahokokuho) => {
        expect(hoken.edaban).equals("");
        const newHokenTmpl = Object.assign({}, hoken.asJson(), { edaban: "01" });
        const result = createOnshiResult(m.patient(patient), m.shahokokuho(createShahokokuho(newHokenTmpl)));
        console.log("resultItem", result.resultList[0]);
        expect(result.resultList[0].insuredBranchNumber).equals("01");
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
      });
    });
  })

});

