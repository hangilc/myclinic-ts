import { dialogClose, dialogOpen } from "@cypress/lib/dialog";

export function fromToTime(from: string): string {
  return from + ":00";
}

export function untilToTime(until: string): string {
  return fromToTime(until);
}

export const AppointDialogDriver = {
  shouldHaveTitle(title: string): void {
    cy.get(`[data-cy=dialog][data-title='${title}']`).should("exist");
  },

  shouldHaveAppointTimeText(text: string): void {
    cy.get("[data-cy=appoint-time-text]").should("have.text", text);
  },

  setPatientInput(s: string): void {
    cy.get("[data-cy=search-patient-input]").clear().type(s);
  },

  clickSearchIcon(): void {
    cy.get("[data-cy=search-icon]").click();
  },

  shouldHavePatientInputValue(value: string): void {
    cy.get("[data-cy=search-patient-input]").should("have.value", value);
  },

  shouldDisplayPatientId(patientId: number): void {
    cy.get("[data-cy=patient-id-disp]").should("have.text", patientId.toString());
  },

  shouldDisplayBlankPatientId(): void {
    cy.get("[data-cy=patient-id-disp]").should("have.text", "");
  },

  setMemoInput(value: string): void {
    if( value === "" ){
      cy.get("[data-cy=memo-input]").clear();
    } else {
      cy.get("[data-cy=memo-input]").clear().type(value);
    }
  },

  shouldHaveMemoInputValue(value: string): void {
    cy.get("[data-cy=memo-input]").should("have.value", value);
  },

  checkKenshin(): void {
    cy.get("input[type=checkbox][data-cy=kenshin-tag]").check();
  },

  uncheckKenshin(): void {
    cy.get("input[type=checkbox][data-cy=kenshin-tag]").uncheck();
  },

  shouldHaveUncheckedKenshinTag(): void {
    cy.get("input[type=checkbox][data-cy=kenshin-tag]").should("not.be.checked");
  },

  shouldHaveCheckedKenshinTag(): void {
    cy.get("input[type=checkbox][data-cy=kenshin-tag]").should("be.checked");
  },

  checkWithVisit(): void {
    cy.get("input[type=checkbox][data-cy=with-visit]").click();
  },

  shouldNotHaveWithVisit(): void {
    cy.get("input[type=checkbox][data-cy=with-visit]").should("not.exist");
  },

  shouldHaveCheckedWithVisit(): void {
    cy.get("input[type=checkbox][data-cy=with-visit]").should("be.checked");
  },

  shouldHaveUncheckedWithVisit(): void {
    cy.get("input[type=checkbox][data-cy=with-visit]").should("not.be.checked");
  },

  shouldErrorBeVisible(): void {
    cy.get("[data-cy=error]").should("be.visible");
  },

  shouldContainErrorMessage(msg: string): void {
    cy.get("[data-cy=error]").contains(msg);
  },

  enter(): void {
    cy.get("button").contains("入力").click();
  },

  modify(): void {
    cy.get("button").contains("変更入力").click();
  },

  cancelAppoint(): void {
    cy.get("button").contains("予約取消").click();
  },

  cancel(): void {
    cy.get("button").contains("キャンセル").click();
  }
}

export function withAppointDialog(cb: (driver: typeof AppointDialogDriver) => void) {
  dialogOpen("診察予約編集").within(() => cb(AppointDialogDriver));
}

export function appointDialogClose() {
  dialogClose("診察予約編集");
}

export const AppointPatientDriver = {
  shouldDisplayPatientId(patientId: number) {
    cy.get("[data-cy=patient-id-part]").should("have.text", patientId.toString());
  },

  shouldDisplayPatientName(name: string) {
    cy.get("[data-cy=patient-name-part]").should("have.text", name);
  },

  shouldDisplayMemo(memo: string) {
    if( memo ){
      cy.get("[data-cy=memo-part]").should("have.text", memo);
    } else {
      cy.get("[data-cy=memo-part]").should("not.exist");
    }
  },

  shouldHaveTagCount(count: number) {
    cy.get("[data-cy=tag-part]").should("have.length", count);
  },

  shouldDisplayTag(tag: string) {
    cy.get("[data-cy=tag-part]").should("have.text", tag);
  }
}

export function withAppointPatient(patientId: number,
  cb: (driver: typeof AppointPatientDriver) => void): void {
    cy.get(`[data-cy=appoint-patient][data-patient-id=${patientId}]`)
      .should("exist")
      .within(() => cb(AppointPatientDriver));
}