<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import type { Invalid } from "@/lib/validator";
  import { DiseaseEndReason, type DiseaseData } from "myclinic-model";
  import type { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";

  export let env: DiseaseEnv | undefined;
  export let doMode: (mode: Mode) => void;
  const gengouList = ["平成", "令和"];
  let dataSrc: DiseaseData | undefined = env?.editTarget;
  let data: DiseaseData | undefined;

  $: {
    if( dataSrc === undefined ){
      data = undefined;
      startDate = null;
    } else {
      data = dataSrc.clone();
    }
  }
  let startDate: Date | null = null;
  let startDateErrors: Invalid[] = [];
  let endDate: Date | null = null;
  let endDateErrors: Invalid[] = [];
</script>

<div>
  {#if data != undefined}
    <div>
      <div>名前：{data.fullName}</div>
      <div class="date-wrapper start-date">
        <DateFormWithCalendar
          bind:date={startDate}
          bind:errors={startDateErrors}
          {gengouList}
        />
      </div>
      <div class="date-wrapper end-date">
        <DateFormWithCalendar
          bind:date={endDate}
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
      <SearchForm selected={searchSelect} bind:startDate={data.startDate} />
    </div>
  {:else}
    （病名未選択）
  {/if}
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
