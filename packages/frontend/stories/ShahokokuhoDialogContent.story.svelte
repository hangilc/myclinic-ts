<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoDialogContent from "@/cashier/patient-dialog2/edit/ShahokokuhoDialogContent.svelte";

  export let Hst: Hst;
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
  let init: Shahokokuho | null = null;

  function doClose(): void {
    logEvent("close", {});
  }

  async function doEnter(data: Shahokokuho): Promise<string[]> {
    logEvent("data", data);
    return [];
  }

</script>

<Hst.Story>
  <div style:width="330px">
    <ShahokokuhoDialogContent {init} {patient}
      onEnter={doEnter}
      onClose={doClose}/>
  </div>
</Hst.Story>
