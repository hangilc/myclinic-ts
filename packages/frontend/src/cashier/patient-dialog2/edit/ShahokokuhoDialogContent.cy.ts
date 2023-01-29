import { Patient, Shahokokuho } from "myclinic-model";
import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";
// import Button from "@/cashier/patient-dialog2/edit/Button.svelte";

let patient: Patient = new Patient(
  123,
  "診療",
  "太郎",
  "",
  "",
  "M",
  "2000-01-01",
  "",
  ""
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
