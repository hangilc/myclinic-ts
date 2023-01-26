<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Kouhi } from "myclinic-model";
  import KouhiDialogContent from "./KouhiDialogContent.svelte";

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
  let data: Kouhi | null = null;

  function onValueChange(evt: CustomEvent<VResult<Kouhi>>) {
    
  }

  function doClose(): void {
    logEvent("close", {});
  }

  async function doEnter(data: Kouhi): Promise<string[]> {
    logEvent("data", data);
    return [];
  }

</script>

<Hst.Story>
  <div style:width="330px">
    <KouhiDialogContent {data} {patient} on:value-change={onValueChange}
      onEnter={doEnter}
      onClose={doClose}/>
  </div>
</Hst.Story>
