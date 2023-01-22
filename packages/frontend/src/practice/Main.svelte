<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import Cashier from "./cashier/Cashier.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  import { currentPatient } from "./exam/ExamVars";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import DateForm from "@/lib/date-form/DateForm.svelte";

  export let serviceStore: Writable<string>;

  currentPatient.subscribe((p) => {
    if (p == null) {
      document.title = "診察";
    } else {
      document.title = `(${p.patientId}) ${p.fullName("")}`;
    }
  });

  function doChange(r: VResult<Date | null>) {
    if( r.isValid ){
      console.log("result", r.value);
    } else {
      console.log("errors", errorMessagesOf(r.errors));
    }
  }
  let date: Date | null = new Date();

</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  <Cashier isVisible={$serviceStore === "cashier"} />
  <Phone isVisible={$serviceStore === "phone"} />

  <DateForm date={null} onChange={doChange} />
</div>
