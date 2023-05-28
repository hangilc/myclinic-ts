import { Patient, Shahokokuho } from "myclinic-model";
import ShahokokuhoDialogContent from "@/cashier/patient-dialog/edit/ShahokokuhoDialogContent.svelte";

let patient: Patient = new Patient(
  123,
  "診療",
  "太郎",
  "",
  "",
  "M",
  "2000-01-01",
  "",
  "",
  undefined,
);

function doClose(): void {
  console.log("close", {});
}

async function doEnter(data: Shahokokuho): Promise<string[]> {
  console.log("data", data);
  return [];
}

describe("ShahokokuhoDialogContent", () => {
  it("mounts", () => {
    cy.mount(ShahokokuhoDialogContent, {
      props: {
        patient,
        init: null,
        onEnter: doEnter,
        onClose: doClose,
      },
    });
  });
});
