import { toKanjiDate } from "@/lib/to-kanjidate";
import { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import { format, f2, KanjiDate } from "kanjidate";
import patientTmpl from "@cypress/fixtures/patient-a.json";

export function fillPatientForm(patient: Patient) {
  const bd = toKanjiDate(patient.birthday);
  cy.get("[data-cy=last-name-input").clear().type(patient.lastName);
  cy.get("[data-cy=first-name-input").clear().type(patient.firstName);
  cy.get("[data-cy=last-name-yomi-input").clear().type(patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi-input").clear().type(patient.firstNameYomi);
  cy.get(".birthday-input [data-cy=gengou-select]").select(bd.gengou);
  cy.get(".birthday-input [data-cy=nen-input]").clear().type(bd.nen.toString());
  cy.get(".birthday-input [data-cy=month-input]").clear().type(bd.month.toString());
  cy.get(".birthday-input [data-cy=day-input]").clear().type(bd.day.toString());
  cy.get(`[data-cy=sex-input][value=${patient.sex}]`).click();
  cy.get("[data-cy=address-input]").clear().type(patient.address);
  cy.get("[data-cy=phone-input]").clear().type(patient.phone);
}

export function fillDateForm(date: Date | string | null) {
  if (date === null || date === "0000-00-00") {
    cy.get("[data-cy=nen-input]").clear();
    cy.get("[data-cy=month-input]").clear();
    cy.get("[data-cy=day-input]").clear();
  } else {
    const d = toKanjiDate(date);
    cy.get("[data-cy=gengou-select]").select(d.gengou);
    cy.get("[data-cy=nen-input]").clear().type(d.nen.toString());
    cy.get("[data-cy=month-input]").clear().type(d.month.toString());
    cy.get("[data-cy=day-input]").clear().type(d.day.toString());
  }
}

export function assertDateForm(date: Date | string | null) {
  if (date === null || date === "0000-00-00") {
    cy.get("[data-cy=nen-input]").should("have.value", "");
    cy.get("[data-cy=month-input]").should("have.value", "");
    cy.get("[data-cy=day-input]").should("have.value", "");
  } else {
    const d = toKanjiDate(date);
    cy.get("[data-cy=gengou-select]").should("have.value", d.gengou)
    cy.get("[data-cy=nen-input]").should("have.value", d.nen.toString());
    cy.get("[data-cy=month-input]").should("have.value", d.month.toString());
    cy.get("[data-cy=day-input]").should("have.value", d.day.toString());
  }
}

export function assertPatientDisp(patient: Patient) {
  if (patient.patientId === 0) {
    cy.get("[data-cy=patient-id]").should(($e) => {
      const t = $e.text();
      expect(t).match(/^[1-9][0-9]*$/);
    });
  } else {
    cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  }
  cy.get("[data-cy=last-name]").contains(patient.lastName);
  cy.get("[data-cy=first-name]").contains(patient.firstName);
  cy.get("[data-cy=last-name-yomi]").contains(patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi]").contains(patient.firstNameYomi);
  cy.get("[data-cy=birthday]").contains(format(f2, patient.birthday));
  cy.get("[data-cy=sex]").contains(patient.sex === "M" ? "男性" : "女性");
  cy.get("[data-cy=address]").contains(patient.address);
  cy.get("[data-cy=phone]").contains(patient.phone);
}

export function assertPatientForm(patient: Patient) {
  cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  cy.get("[data-cy=last-name-input]").should("have.value", patient.lastName);
  cy.get("[data-cy=first-name-input]").should("have.value", patient.firstName);
  cy.get("[data-cy=last-name-yomi-input]").should("have.value", patient.lastNameYomi);
  cy.get("[data-cy=first-name-yomi-input]").should("have.value", patient.firstNameYomi);
  cy.get("[data-cy=birthday-input-wrapper]").within(() => {
    const bd = new KanjiDate(new Date(patient.birthday));
    cy.get("[data-cy=gengou-select]").select(bd.gengou);
    cy.get("[data-cy=nen-input]").should("have.value", bd.nen.toString());
    cy.get("[data-cy=month-input]").should("have.value", bd.month.toString());
    cy.get("[data-cy=day-input]").should("have.value", bd.day.toString());
  });
  cy.get(`[data-cy=sex-input][value=${patient.sex}]:checked`);
  cy.get("[data-cy=address-input]").should("have.value", patient.address);
  cy.get("[data-cy=phone-input]").should("have.value", patient.phone);
}

export function assertShahokokuhoForm(patient: Patient, h: Shahokokuho) {
  cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  cy.get("[data-cy=patient-name]").contains(patient.fullName(" "));
  cy.get("[data-cy=hokensha-bangou-input]").should("have.value", h.hokenshaBangou.toString());
  cy.get("[data-cy=hihokensha-kigou-input]").should("have.value", h.hihokenshaKigou);
  cy.get("[data-cy=hihokensha-bangou-input]").should("have.value", h.hihokenshaBangou);
  cy.get("[data-cy=edaban-input]").should("have.value", h.edaban);
  cy.get("[data-cy=honnin-input]:checked").should("have.value", h.honninStore.toString());
  cy.get("[data-cy=valid-from-input]").within(() => assertDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => assertDateForm(h.validUpto));
  cy.get("[data-cy=kourei-input]:checked").should("have.value", h.koureiStore.toString());
}

export function fillShahokokuhoForm(h: Shahokokuho) {
  cy.get("[data-cy=hokensha-bangou-input]").clear().type(h.hokenshaBangou.toString());
  cy.get("[data-cy=hihokensha-kigou-input]").clear().type(h.hihokenshaKigou);
  cy.get("[data-cy=hihokensha-bangou-input]").clear().type(h.hihokenshaBangou);
  cy.get("[data-cy=edaban-input]").clear().type(h.edaban);
  cy.get("[data-cy=honnin-input]").check(h.honninStore.toString());
  cy.get("[data-cy=valid-from-input]").within(() => fillDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => fillDateForm(h.validUpto));
  cy.get("[data-cy=kourei-input]").check(h.koureiStore.toString());
}

export function assertKoukikoureiForm(patient: Patient, h: Koukikourei) {
  cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  cy.get("[data-cy=patient-name]").contains(patient.fullName(" "));
  cy.get("[data-cy=hokensha-bangou-input]").should("have.value", h.hokenshaBangou);
  cy.get("[data-cy=hihokensha-bangou-input]").should("have.value", h.hihokenshaBangou);
  cy.get("[data-cy=futan-wari-input]:checked").should("have.value", h.futanWari.toString());
  cy.get("[data-cy=valid-from-input]").within(() => assertDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => assertDateForm(h.validUpto));
}

export function fillKoukikoureiForm(h: Koukikourei) {
  cy.get("[data-cy=hokensha-bangou-input]").clear().type(h.hokenshaBangou);
  cy.get("[data-cy=hihokensha-bangou-input]").clear().type(h.hihokenshaBangou);
  cy.get("[data-cy=futan-wari-input]").check(h.futanWari.toString());
  cy.get("[data-cy=valid-from-input]").within(() => fillDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => fillDateForm(h.validUpto));
}

export function assertKouhiForm(patient: Patient, h: Kouhi) {
  cy.get("[data-cy=patient-id]").contains(patient.patientId.toString());
  cy.get("[data-cy=patient-name]").contains(patient.fullName(" "));
  cy.get("[data-cy=futansha-input]").should("have.value", h.futansha.toString());
  cy.get("[data-cy=jukyuusha-input]").should("have.value", h.jukyuusha.toString());
  cy.get("[data-cy=valid-from-input]").within(() => assertDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => assertDateForm(h.validUpto));
}

export function fillKouhiForm(h: Kouhi) {
  cy.get("[data-cy=futansha-input]").clear().type(h.futansha.toString());
  cy.get("[data-cy=jukyuusha-input]").clear().type(h.jukyuusha.toString());
  cy.get("[data-cy=valid-from-input]").within(() => fillDateForm(h.validFrom));
  cy.get("[data-cy=valid-upto-input]").within(() => fillDateForm(h.validUpto));
}

export function newPatient() {
  const user = patientTmpl;
  return cy.request("POST", Cypress.env("API") + "/enter-patient", user)
    .then((response) => Patient.cast(response.body))
}

export function newShahokokuho(patientId: number) {
  return cy.fixture("new-shahokokuho-template.json")
    .then((tmpl) => {
      tmpl.patientId = patientId;
      return cy.request("POST", Cypress.env("API") + "/enter-shahokokuho", tmpl)
        .then((response) => Shahokokuho.cast(response.body))
    })
}

export function newKoukikourei(patientId: number, data?: any) {
  if (data) {
    data.patientId = patientId;
    return cy.request("POST", Cypress.env("API") + "/enter-koukikourei", data)
      .then((response) => Koukikourei.cast(response.body))
  } else {
    return cy.fixture("new-koukikourei-template.json")
      .then((tmpl) => {
        tmpl.patientId = patientId;
        return cy.request("POST", Cypress.env("API") + "/enter-koukikourei", tmpl)
          .then((response) => Koukikourei.cast(response.body))
      })
  }
}

export function newKouhi(patientId: number, data?: any) {
  if( data ){
    data.patientId = patientId;
    return cy.request("POST", Cypress.env("API") + "/enter-kouhi", data)
    .then((response) => Kouhi.cast(response.body))
  } else {
    return cy.fixture("new-kouhi-template.json")
    .then((tmpl) => {
      tmpl.patientId = patientId;
      return cy.request("POST", Cypress.env("API") + "/enter-kouhi", tmpl)
        .then((response) => Kouhi.cast(response.body))
    })
  }
}

export function openPatientDialog(patientId: number) {
  cy.get("form [data-cy=search-text-input]").type(patientId.toString());
  cy.get("form [data-cy=search-button]").click();
  dialogOpen("患者情報");
}

export function patientDialogClose() {
  dialogClose("患者情報");
}

export function dialogOpen(title: string) {
  cy.get("[data-cy=dialog-title]").contains(title);
}

export function dialogClose(title: string) {
  cy.get("[data-cy=dialog-title]").contains(title).should("not.exist");
}
