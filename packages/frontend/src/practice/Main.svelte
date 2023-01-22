<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import Cashier from "./cashier/Cashier.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  import { currentPatient } from "./exam/ExamVars";

  import DateForm from "@/lib/date-form/DateForm.svelte";
  import { errorMessagesOf, validResult, VResult, type VError } from "@/lib/validation";
  import DateFormPulldown from "@/lib/date-form/DateFormPulldown.svelte";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";

  export let serviceStore: Writable<string>;

  currentPatient.subscribe((p) => {
    if (p == null) {
      document.title = "診察";
    } else {
      document.title = `(${p.patientId}) ${p.fullName("")}`;
    }
  });

  let dateResult: VResult<Date | null> = validResult(null);
  function doFormChange(r: VResult<Date | null>): void {
    dateResult = r;
  }

  let date = new Date();
  function doFormEnter(){
  }
</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  <Cashier isVisible={$serviceStore === "cashier"} />
  <Phone isVisible={$serviceStore === "phone"} />

  <EditableDate bind:date={date} />
  <div>{date}</div>
  {#if dateResult.isValid}
    {dateResult.value}
  {:else}
    {#each errorMessagesOf(dateResult.errors) as error}
      <div>
        {error}
      </div>
    {/each}
  {/if}
</div>
