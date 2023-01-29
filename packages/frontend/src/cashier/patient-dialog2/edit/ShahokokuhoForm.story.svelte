<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { dateToSqlDate, Patient, Shahokokuho } from "myclinic-model";
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
  let validate: () => VResult<Shahokokuho>
  let setData: (data: Shahokokuho | null) => void;

  function logResult(r: VResult<Shahokokuho>): void {
    if( r.isValid ){
      logEvent("data", { data: r.value });
    } else {
      const messages = errorMessagesOf(r.errors);
      logEvent("error", { messages });
    }
  }

  function doValueChange(): void {
    logResult(validate());
  }

  function doSet(): void {
    const data = new Shahokokuho(
      1,
      12,
      1234,
      "a",
      "23",
      0,
      dateToSqlDate(new Date()),
      "0000-00-00",
      0,
      "01",
    );
    setData(data);
  }

  function doValidate(): void {
    logResult(validate());
  }

</script>

<Hst.Story>
  <div style:width="460px">
    <ShahokokuhoForm {patient} init={null} on:value-change={doValueChange} bind:validate bind:setData/>
  </div>
  <div>
    <button on:click={doSet}>Set</button>
    <button on:click={doValidate}>Validate</button>
  </div>
</Hst.Story>

