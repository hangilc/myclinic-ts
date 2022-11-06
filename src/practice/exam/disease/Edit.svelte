<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { DiseaseEndReason, type DiseaseEndReasonType } from "@/lib/model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import {
    fullName,
    getEndReason,
    startDateRep,
    hasEndDate,
    endDateRep,
    startDateOf,
    getStartDate,
    type DiseaseData,
    type SearchResultType,
  } from "./types";
  import SearchForm from "./SearchForm.svelte";

  export let list: DiseaseData[];
  let selected: Writable<DiseaseData | null> = writable(null);
  let name: string;
  let startDate: Date | null = null;
  let startDateErrors: string[] = [];

  selected.subscribe((sel) => {
    if (sel != null) {
      name = fullName(sel);
      startDate = startDateOf(sel);
    }
  });

  // selected.subscribe(sel => {
  //   if( sel != null ){
  //     startDateForm.initValues(startDateOf(sel));
  //   }
  // })

  // let startDate: Date | null = selected
  //   ? new Date(getStartDate(selected))
  //   : null;
  // let endDate: Date | null = selected
  //   ? getEndDate(selected) === "0000-00-00"
  //     ? null
  //     : new Date(getEndDate(selected))
  //   : null;
  // let endReason: DiseaseEndReasonType =
  //   selected
  //   ? getEndReason(selected)
  //   : DiseaseEndReason.NotEnded;
  const gengouList = ["平成", "令和"];
  // let searchSelect: Writable<SearchResultType> = writable(null);

  function formatAux(data: DiseaseData): string {
    const reason = getEndReason(data);
    const start = startDateRep(data);
    let end: string = "";
    if (hasEndDate(data)) {
      end = ` - ${endDateRep(data)}`;
    }
    return `${reason.label}、${start}${end}`;
  }

  // function doCancel(): void {
  //   selected = null;
  // }
</script>

<div>
  <div>
    {#if $selected != null}
      <div>
        <div>名前：{name}</div>
        <div class="date-wrapper start-date">
          <DateFormWithCalendar
            bind:date={startDate}
            bind:errors={startDateErrors}
            {gengouList}
          />
        </div>
        <!-- <div class="date-wrapper end-date">
          <DateFormWithCalendar bind:date={endDate} {gengouList} />
        </div>
        <div class="end-reason">
          {#each Object.values(DiseaseEndReason) as reason}
            {@const id = genid()}
            <input type="radio" bind:group={endReason} value={reason} {id} />
            <label for={id}>{reason.label}</label>
          {/each}
        </div>
        <div>
          <button>入力</button>
          <a href="javascript:void(0)" on:click={doCancel}>キャンセル</a>
        </div>
        <div>
          <a href="javascript:void(0)">の疑い</a>
          <a href="javascript:void(0)">修飾語削除</a>
          <a href="javascript:void(0)">終了日クリア</a>
          <a href="javascript:void(0)">削除</a>
        </div>
        <SearchForm selected={searchSelect} {startDate} /> -->
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
  .list.select {
    height: 10em;
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
