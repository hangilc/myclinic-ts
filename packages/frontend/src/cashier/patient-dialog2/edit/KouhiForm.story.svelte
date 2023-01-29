<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Kouhi } from "myclinic-model";
  import KouhiForm from "./KouhiForm.svelte";

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
  let validate: () => VResult<Kouhi>;

  function logResult(r: VResult<Kouhi>): void {
    if (r.isValid) {
      logEvent("data", { data: r.value });
    } else {
      const messages = errorMessagesOf(r.errors);
      logEvent("error", { messages });
    }
  }

  function doValueChange(): void {
    console.log("change", validate());
  }

  function doValidate(): void {
    logResult(validate());
  }
</script>

<Hst.Story>
  <Hst.Variant title="new">
    <div style:width="460px">
      <KouhiForm
        {patient}
        init={null}
        on:value-change={doValueChange}
        bind:validate
      />
    </div>
    <div>
      <button on:click={doValidate}>Validate</button>
    </div>
  </Hst.Variant>
  <Hst.Variant title="update">
    <div style:width="460px">
      <KouhiForm
        {patient}
        init={dataSet}
        on:value-change={doValueChange}
        bind:validate
      />
    </div>
    <div>
      <button on:click={doValidate}>Validate</button>
    </div>
  </Hst.Variant>
</Hst.Story>
