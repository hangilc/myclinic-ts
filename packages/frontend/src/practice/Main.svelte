<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import Cashier from "./cashier/Cashier.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  import { currentPatient } from "./exam/ExamVars";
  
  import DateForm from "@/lib/date-form/DateForm.svelte";
  import { errorMessagesOf, type VError } from "@/lib/validation";
  import DateFormPulldown from "@/lib/date-form/DateFormPulldown.svelte";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";

  export let serviceStore: Writable<string>;

  currentPatient.subscribe(p => {
    if( p == null ){
      document.title = "診察"
    } else {
      document.title = `(${p.patientId}) ${p.fullName("")}`;
    }
  });

  let errors: VError[] = [];
</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  <Cashier isVisible={$serviceStore === "cashier" } />
  <Phone isVisible={$serviceStore === "phone"} />

  <DateFormWithCalendar date={new Date()} bind:errors/>
  {#each errorMessagesOf(errors) as error}
    <div>
      {error}
    </div>
  {/each}
</div>