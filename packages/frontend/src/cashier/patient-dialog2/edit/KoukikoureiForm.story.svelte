<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiForm from "./KoukikoureiForm.svelte";

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
  let validate: () => VResult<Koukikourei>;
  const dataSet: Koukikourei = new Koukikourei(
    1,
    12,
    "1234",
    "23",
    1,
    "2023-01-26",
    "0000-00-00"
  );

  function logResult(r: VResult<Koukikourei>): void {
    if (r.isValid) {
      logEvent("data", { data: r.value });
    } else {
      const messages = errorMessagesOf(r.errors);
      logEvent("error", { messages });
    }
  }

  function doValueChange(): void {
    logResult(validate());
  }

  function doValidate(): void {
    logResult(validate());
  }
</script>

<Hst.Story>
  <Hst.Variant title="new">
    <div style:width="460px">
      <KoukikoureiForm
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
      <KoukikoureiForm
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
