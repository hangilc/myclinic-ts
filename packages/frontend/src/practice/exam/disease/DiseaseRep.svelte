<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import { startDateRep } from "./start-date-rep";
  import type { DiseaseEnv } from "./disease-env";
  import { DateWrapper } from "myclinic-util";
  import api from "@/lib/api";

  export let disease: DiseaseData;
  export let env: DiseaseEnv | undefined;
  let dmSuspEndDate: string | undefined = undefined;

  if (disease.fullName === "糖尿病の疑い") {
    const checkingDateValue = env?.checkingDate;
    if (checkingDateValue) {
      const startDate = DateWrapper.from(disease.disease.startDate);
      const checkingDate = DateWrapper.from(checkingDateValue);
      let endDate = startDate.incDay(7);
      if (
        checkingDate.gt(endDate) &&
        checkingDate.ge(endDate.getFirstDayOfNextMonth())
      ) {
        dmSuspEndDate = endDate.asSqlDate();
      }
    }
  }

  async function endDm(endDate: string) {
    const diseaseId = disease.disease.diseaseId;
    await api.endDisease(diseaseId, endDate, "S");
  }
</script>

<span data-cy="disease-name">{disease.fullName}</span>
<span class="start-date" data-cy="disease-aux"
  >({startDateRep(disease.disease.startDateAsDate)})</span
>
{#if dmSuspEndDate}
  <!-- svelte-ignore a11y-missing-content -->
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="javascript:void(0)"
    on:click|stopPropagation={() => endDm(dmSuspEndDate)}
    >{dmSuspEndDate}に終了</a
  >
{/if}

<style>
  .start-date {
    font-size: 100%;
    color: #666;
  }
</style>
