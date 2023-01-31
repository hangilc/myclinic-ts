<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Kouhi } from "myclinic-model";
  import KouhiDialogContent from "@/cashier/patient-dialog2/edit/KouhiDialogContent.svelte";

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
  let dataSet: Kouhi = new Kouhi(1, 1234, 23, "2023-01-26", "0000-00-00", 12);

  function doClose(): void {
    logEvent("close", {});
  }

  async function doEnter(data: Kouhi): Promise<string[]> {
    logEvent("data", data);
    return [];
  }

</script>

<Hst.Story>
  <Hst.Variant title="new">
    <div style:width="360px">
      <KouhiDialogContent init={null} {patient}
        onEnter={doEnter}
        onClose={doClose}/>
    </div>
  </Hst.Variant>

  <Hst.Variant title="update">
    <div style:width="360px">
      <KouhiDialogContent init={dataSet} {patient}
        onEnter={doEnter}
        onClose={doClose}/>
    </div>
  </Hst.Variant>
</Hst.Story>
