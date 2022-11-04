<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
    import { genid } from "@/lib/genid";
    import { DiseaseEndReason, type DiseaseEndReasonType } from "@/lib/model";
import SelectItem from "@/lib/SelectItem.svelte";
    import { each } from "svelte/internal";
    import { writable, type Writable } from "svelte/store";
  import {
    fullName,
    getEndReason,
    startDateRep,
    hasEndDate,
    endDateRep,
    getEndDate,
    getStartDate,
    type DiseaseData,
  } from "./types";

  export let list: DiseaseData[];
  export let selected: Writable<DiseaseData | null> = writable(null);
  export let startDate: Date;
  export let endDate: Date | null;
  export let endReason: DiseaseEndReasonType;
  selected.subscribe(data => {
    if( data != null ){
      startDate = new Date(getStartDate(data));
      endDate = hasEndDate(data) ? new Date(getEndDate(data)) : null;
      endReason = getEndReason(data);
    }
  });
  const gengouList = ["平成", "令和"];
  const searchKinds = ["病名", "修飾語"];
  let searchKind = "病名";

  function formatAux(data: DiseaseData): string {
    const reason = getEndReason(data);
    const start = startDateRep(data);
    let end: string = "";
    if (hasEndDate(data)) {
      end = ` - ${endDateRep(data)}`;
    }
    return `${reason.label}、${start}${end}`;
  }
</script>

<div>
  <div>
    {#if $selected != null}
      <div>
        <div>名前：{fullName($selected)}</div>
        <div class="date-wrapper start-date">
          <DateFormWithCalendar bind:date={startDate} gengouList={gengouList}/>
        </div>
        <div class="date-wrapper end-date">
          <DateFormWithCalendar bind:date={endDate} gengouList={gengouList}/>
        </div>
        <div class="end-reason">
          {#each Object.values(DiseaseEndReason) as reason}
          {@const id=genid()}
            <input type="radio" bind:group={endReason} value={reason} id={id} />
            <label for={id}>{reason.label}</label>
          {/each}
        </div>
        <div>
          <button>入力</button>
        </div>
        <div>
          <a href="javascript:void(0)">の疑い</a>
          <a href="javascript:void(0)">修飾語削除</a>
          <a href="javascript:void(0)">終了日クリア</a>
          <a href="javascript:void(0)">削除</a>
        </div>
        <div>
          {#each searchKinds as kind}
          {@const id=genid()}
            <input type="radio" bind:group={searchKind} value={kind} id={id} />
            <label for={id}>{kind}</label>
          {/each}
        </div>
        <div>
          <input type="text" class="search-text-input"/> <button>検索</button>
        </div>
        <div class="select">

        </div>
      </div>
    {:else}
      （病名未選択）
    {/if}
  </div>
  <div class="list select">
    {#each list as data}
      <SelectItem {selected} {data}>
        <span class="disease-name" class:hasEnd={hasEndDate(data)}
          >{fullName(data)}</span
        > <span>({formatAux(data)})</span>
      </SelectItem>
    {/each}
  </div>
</div>

<style>
  .list {
    max-height: 10em;
    overflow-y: auto;
    font-size: 14px;
    margin-top: 10px;
  }

  .disease-name {
    color: red;
  }

  .disease-name.hasEnd {
    color: green;
  }

  .date-wrapper {
    font-size: 14px;
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

  .search-text-input {
    width: 10em;
  }

  .select {
    height: 5em;
    overflow-y: auto;
  }
</style>
