<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SelectItem from "@/lib/SelectItem.svelte";
  import type { Invalid } from "@/lib/validator";
  import {
    ByoumeiMaster,
    DiseaseEndReason,
    DiseaseExample,
    ShuushokugoMaster,
    type DiseaseData,
  } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";
  import { endDateRep } from "./end-date-rep";
  import type { Mode } from "./mode";
  import DiseaseSearchForm from "./search/DiseaseSearchForm.svelte";
  import { startDateRep } from "./start-date-rep";

  export let env: DiseaseEnv | undefined;
  export let doMode: (mode: Mode) => void;
  const gengouList = ["平成", "令和"];
  let dataSrc: DiseaseData | undefined = env?.editTarget;
  let data: DiseaseData | undefined;
  let diseaseDataSelected: Writable<DiseaseData | null> = writable(null);
  let startDateErrors: Invalid[] = [];
  let endDateErrors: Invalid[] = [];

  $: {
    if (dataSrc === undefined) {
      data = undefined;
    } else {
      data = dataSrc.clone();
    }
    startDateErrors = [];
    endDateErrors = [];
  }

  diseaseDataSelected.subscribe((sel) => {
    dataSrc = sel ?? undefined;
  });

  function doEnter() {}

  function doCancel() {
    dataSrc = undefined;
  }

  function onSearchSelect(
    sel: ByoumeiMaster | ShuushokugoMaster | DiseaseExample
  ) {}
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
</script>

{#if env != undefined}
  {#if data != undefined}
    <div>
      <div>名前：{data.fullName}</div>
      <div class="date-wrapper start-date">
        <DateFormWithCalendar
          bind:date={data.startDate}
          bind:errors={startDateErrors}
          {gengouList}
        />
      </div>
      <div class="date-wrapper end-date">
        <DateFormWithCalendar
          bind:date={data.endDate}
          bind:errors={endDateErrors}
          isNullable={true}
          {gengouList}
        />
      </div>
      <div class="end-reason">
        {#each Object.values(DiseaseEndReason) as reason}
          {@const id = genid()}
          <input type="radio" bind:group={data.endReason} value={reason} {id} />
          <label for={id}>{reason.label}</label>
        {/each}
      </div>
      <div>
        <button on:click={doEnter}>入力</button>
        <a href="javascript:void(0)" on:click={doCancel}>キャンセル</a>
      </div>
      <DiseaseSearchForm
        examples={env.examples}
        startDate={data.startDate}
        onSelect={onSearchSelect}
      />
    </div>
  {:else}
    （病名未選択）
  {/if}
  <div class="list select">
    {#each env?.allList ?? [] as data}
      <SelectItem selected={diseaseDataSelected} {data}>
        <span class="disease-name" class:hasEnd={data.hasEndDate}
          >{data.fullName}</span
        > <span>({formatAux(data)})</span>
      </SelectItem>
    {/each}
  </div>
{/if}

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

  .date-wrapper {
    font-size: 13px;
    margin-top: 4px;
  }

  .date-wrapper :global(.calendar-icon) {
    margin-left: 6px;
    font-size: 16px;
    position: relative;
    top: 1px;
  }

  .end-reason {
    font-size: 13px;
  }

  .select {
    height: 5em;
    overflow-y: auto;
  }
</style>
