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

  export let diseases: DiseaseData[];
  export let examples: DiseaseExample[] = [];
  export let editTarget: DiseaseData | null = null;
  export let onDelete: (diseaseId: number) => void = (_) => {};
  export let onUpdate: (updated: DiseaseData) => void = (_) => {};

  let formValues: EditFormValues | undefined;
  let diseaseDataSelected: Writable<DiseaseData | null> = writable(editTarget);

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
</script>

<div data-cy="disease-edit">
  {#key formValues}
    {#if formValues == undefined}
      <span data-cy="no-disease-selected">（病名未選択）</span>
    {:else}
      <EditForm
        {examples}
        {formValues}
        onCancel={doFormCancel}
        onEnter={onUpdate}
        {onDelete}
      />
    {/if}
  {/key}
  <div class="list select">
    {#each diseases as data}
      <SelectItem selected={diseaseDataSelected} {data}>
        <span
          class="disease-name"
          class:hasEnd={data.hasEndDate}
          data-cy="disease-name"
          data-disease-id={data.disease.diseaseId}>{data.fullName}</span
        >
        <span data-cy="disease-aux" data-disease-id={data.disease.diseaseId}
          >({formatAux(data)})</span
        >
      </SelectItem>
    {/each}
  </div>
</div>

<style>
  .list.select {
    height: 10em;
    overflow-y: auto;
    font-size: 13px;
    margin-top: 10px;
  }

  .disease-name {
    color: red;
  }

  .disease-name.hasEnd {
    color: green;
  }
</style>
