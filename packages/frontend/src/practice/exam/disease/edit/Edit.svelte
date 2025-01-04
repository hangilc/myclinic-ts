<script lang="ts">
  import SelectItem from "@/lib/SelectItem.svelte";
  import type { DiseaseData, DiseaseExample } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { endDateRep } from "../end-date-rep";
  import { startDateRep } from "../start-date-rep";
  import {
    composeEditFormValues,
    type EditFormValues,
  } from "./edit-form-values";
  import EditForm from "./EditForm.svelte";
  import type { DiseaseEnv } from "../disease-env";
  import { cache } from "@/lib/cache";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onDelete: (diseaseId: number) => void = (_) => {};
  export let onUpdate: (updated: DiseaseData) => void = (_) => {};

  let formValues: EditFormValues | undefined;
  let diseaseDataSelected: Writable<DiseaseData | null> = writable($env?.editTarget ?? null);

  diseaseDataSelected.subscribe((sel) => {
    formValues = sel == undefined ? undefined : composeEditFormValues(sel);
  });

  function formatAux(data: DiseaseData): string {
    const reason = data.endReason;
    const start = startDateRep(data.startDate);
    let end: string = "";
    const endDate = data.endDate;
    if (endDate != null) {
      end = ` - ${endDateRep(endDate)}`;
    }
    return `${reason.label}、${start}${end}`;
  }

  function doFormCancel() {
    formValues = undefined;
  }

  function doFormUpdate(entered: DiseaseData) {
    onUpdate(entered);
    formValues = undefined;
  }

  function doFormDelete(diseaseId: number) {
    onDelete(diseaseId);
    formValues = undefined;
  }

</script>

<div data-cy="disease-edit">
  {#key formValues}
    {#if formValues == undefined}
      <span data-cy="no-disease-selected">（病名未選択）</span>
    {:else}
      <EditForm
        {formValues}
        onCancel={doFormCancel}
        onEnter={doFormUpdate}
        onDelete={doFormDelete}
      />
    {/if}
  {/key}
  <div class="list select" data-cy="disease-list">
    {#each ($env?.allList ?? []) as data (data.disease.diseaseId)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="item" on:click={() => $diseaseDataSelected = data}>
        <span
          class="disease-name"
          class:hasEnd={data.hasEndDate}
          data-cy="disease-name"
          data-disease-id={data.disease.diseaseId}>{data.fullName}</span
        >
        <span data-cy="disease-aux" data-disease-id={data.disease.diseaseId}
          >({formatAux(data)})</span
        >
      </div>
    {/each}
  </div>
</div>

<style>
  .list.select {
    height: fit-content;
    max-height: 10em;
    overflow-y: auto;
    font-size: 13px;
    margin-top: 10px;
  }

  .item {
    cursor: pointer;
    user-select: none;
  }

  .disease-name {
    color: red;
  }

  .disease-name.hasEnd {
    color: green;
  }
</style>
