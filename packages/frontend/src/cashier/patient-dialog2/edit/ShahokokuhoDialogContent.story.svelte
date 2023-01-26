<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";

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
  let data: Shahokokuho | null = null;

  function onValueChange(evt: CustomEvent<VResult<Shahokokuho>>) {
    
  }

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
    <ShahokokuhoDialogContent {data} {patient} on:value-change={onValueChange}
      onEnter={doEnter}
      onClose={doClose}/>
  </div>
</Hst.Story>
