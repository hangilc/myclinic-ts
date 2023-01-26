<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Koukikourei } from "myclinic-model";
  import { KoukikoureiFormValues } from "./koukikourei-form-values";
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
  let data: Koukikourei | null = null;
  let values = KoukikoureiFormValues.blank(patient.patientId);
  let validate: () => VResult<Koukikourei>

  function logResult(r: VResult<Koukikourei>): void {
    if( r.isValid ){
      logEvent("data", { data: r.value });
    } else {
      const messages = errorMessagesOf(r.errors);
      logEvent("error", { messages });
    }
  }

  function doValueChange(evt: CustomEvent<VResult<Koukikourei>>): void {
    console.log("change", evt.detail);
  }

  function doSet(): void {
    data = new Koukikourei(
      1, 12, "1234", "23", 1, "2023-01-26", "0000-00-00"
    )
  }

  function doValidate(): void {
    logResult(validate());
  }

</script>

<Hst.Story>
  <div style:width="460px">
    <KoukikoureiForm {patient} bind:data={data} on:value-change={doValueChange} bind:validate/>
  </div>
  <div>
    <button on:click={doSet}>Set</button>
    <button on:click={doValidate}>Validate</button>
  </div>
</Hst.Story>

