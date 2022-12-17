<script lang="ts">
  import SelectItem from "@/lib/SelectItem.svelte";
  import type { DiseaseData } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import type { DiseaseEnv } from "../disease-env";
  import { endDateRep } from "../end-date-rep";
  import type { Mode } from "../mode";
  import { startDateRep } from "../start-date-rep";
  import {
    composeEditFormValues,
    type EditFormValues,
  } from "./edit-form-values";
  import EditForm from "./EditForm.svelte";

  export let env: DiseaseEnv;
  export let doMode: (mode: Mode) => void;

  let formValues: EditFormValues | undefined =
    env.editTarget == undefined
      ? undefined
      : composeEditFormValues(env.editTarget);
  let diseaseDataSelected: Writable<DiseaseData | null> = writable(null);

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
  function doFormEnter(d: DiseaseData) {
    env.updateDisease(d);
    doMode("edit");
  }
</script>

{#key formValues}
  {#if formValues == undefined}
    （病名未選択）
  {:else}
    <EditForm
      examples={env.examples}
      {formValues}
      onCancel={doFormCancel}
      onEnter={doFormEnter}
    />
  {/if}
{/key}
<div class="list select">
  {#each env?.allList ?? [] as data}
    <SelectItem selected={diseaseDataSelected} {data}>
      <span class="disease-name" class:hasEnd={data.hasEndDate}
        >{data.fullName}</span
      > <span>({formatAux(data)})</span>
    </SelectItem>
  {/each}
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
