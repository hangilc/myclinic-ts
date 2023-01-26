<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiDialogContent from "./KoukikoureiDialogContent.svelte";

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
  let data: Koukikourei | null = null;

  function onValueChange(evt: CustomEvent<VResult<Koukikourei>>) {
    
  }

  function doClose(): void {
    logEvent("close", {});
  }

  async function doEnter(data: Koukikourei): Promise<string[]> {
    logEvent("data", data);
    return [];
  }

</script>

<Hst.Story>
  <div style:width="330px">
    <KoukikoureiDialogContent {data} {patient} on:value-change={onValueChange}
      onEnter={doEnter}
      onClose={doClose}/>
  </div>
</Hst.Story>
