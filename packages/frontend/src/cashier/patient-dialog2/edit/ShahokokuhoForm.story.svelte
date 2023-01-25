<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient, Shahokokuho } from "myclinic-model";
  import { ShahokokuhoFormValues } from "./shahokokuho-form-values";
  import ShahokokuhoForm from "./ShahokokuhoForm.svelte";

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
  let values = ShahokokuhoFormValues.blank();
  let validate: () => VResult<Shahokokuho>

  function logResult(r: VResult<Shahokokuho>): void {
    if( r.isValid ){
      logEvent("data", { data: r.value });
    } else {
      const messages = errorMessagesOf(r.errors);
      logEvent("error", { messages });
    }
  }

  function doValueChanged(evt: CustomEvent<VResult<Shahokokuho>>): void {
    logResult(evt.detail);
  }

  function doSet(): void {
    values = new ShahokokuhoFormValues({
      shahokokuhoId: 1,
      patientId: 12,
      hokenshaBangou: "1234",
      hihokenshaKigou: "a",
      hihokenshaBangou: "23",
      edaban: "01",
      honninStore: 0,
      validFrom: new Date(),
      validUpto: null,
      koureiStore: 0
    })
  }

  function doValidate(): void {
    logResult(validate());
  }

</script>

<Hst.Story>
  <div style:width="460px">
    <ShahokokuhoForm {patient} {values} on:value-changed={doValueChanged} bind:validate/>
  </div>
  <div>
    <button on:click={doSet}>Set</button>
    <button on:click={doValidate}>Validate</button>
  </div>
</Hst.Story>

