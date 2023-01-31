<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiDialogContent from "@/cashier/patient-dialog2/edit/KoukikoureiDialogContent.svelte";

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
  const dataSet: Koukikourei = new Koukikourei(
    1,
    12,
    "1234",
    "23",
    1,
    "2023-01-26",
    "0000-00-00"
  );

  function doClose(): void {
    logEvent("close", {});
  }

  async function doEnter(data: Koukikourei): Promise<string[]> {
    logEvent("data", data);
    return [];
  }

</script>

<Hst.Story>
  <Hst.Variant title="new">
    <div style:width="360px">
      <KoukikoureiDialogContent init={null} {patient}
        onEnter={doEnter}
        onClose={doClose}/>
    </div>
  </Hst.Variant>
  <Hst.Variant title="update">
    <div style:width="360px">
      <KoukikoureiDialogContent init={dataSet} {patient}
        onEnter={doEnter}
        onClose={doClose}/>
    </div>
  </Hst.Variant>
</Hst.Story>
