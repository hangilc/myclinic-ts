<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import {
    ByoumeiMaster,
    DiseaseEndReason,
    DiseaseExample,
    ShuushokugoMaster,
    type DiseaseEndReasonType,
    type DiseaseData,
    Disease,
  } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import type {
    SearchResultType,
  } from "./types";
  import SearchForm from "./SearchForm.svelte";
  import { dateToSql } from "@/lib/util";
  import api from "@/lib/api";

  export let list: DiseaseData[];

  let curDisease: Writable<Disease | null> = writable(null);
  let curByoumeiMaster: Writable<ByoumeiMaster | null> = writable(null);
  let curStartDate

  let selected: Writable<DiseaseData | null> = writable(null);
  let name: string;
  let startDate: Date = new Date();
  let startDateErrors: string[] = [];
  let endDate: Date | null = null;
  let endDateErrors: string[] = [];
  let endReason: DiseaseEndReasonType = DiseaseEndReason.NotEnded;
  let searchSelect: Writable<SearchResultType | null> = writable(null);

  searchSelect.subscribe((sel) => {
    if ($selected != null) {
      const data = $selected.clone();
      if (ByoumeiMaster.isByoumeiMaster(sel)) {
        data.disease.shoubyoumeicode = sel.shoubyoumeicode;
        data.byoumeiMaster = sel;
        selected.set(data);
      } else if (ShuushokugoMaster.isShuushokugoMaster(sel)) {
        $selected[2];
      } else if (DiseaseExample.isDiseaseExample(sel)) {
      }
    }
  });

  selected.subscribe((sel) => {
    if (sel != null) {
      console.log("sel updated", sel);
      name = fullName(sel);
      startDate = startDateOf(sel);
      endDate = endDateOf(sel);
      endReason = getEndReason(sel);
    }
  });

  const gengouList = ["平成", "令和"];

  function formatAux(data: DiseaseData): string {
    const reason = getEndReason(data);
    const start = startDateRep(data);
    let end: string = "";
    if (hasEndDate(data)) {
      end = ` - ${endDateRep(data)}`;
    }
    return `${reason.label}、${start}${end}`;
  }

  async function doEnter() {
    if ($selected == null) {
      return;
    }
    const data = copyDiseaseData($selected);
    if (startDate == null) {
      alert("エラー：開始日が設定されていません。");
      return;
    }
    data[0].startDate = dateToSql(startDate);
    data[0].endDate = endDate == null ? "0000-00-00" : dateToSql(endDate);
    data[0].endReasonStore = endReason.code;
    if (data[0].endReasonStore === "N") {
      data[0].endDate = "0000-00-00";
    }
    if (
      !(
        data[0].endDate === "0000-00-00" || data[0].startDate <= data[0].endDate
      )
    ) {
      alert("エラー：開始日が終了日の後です。");
      return;
    }
    await api.updateDiseaseEx(
      data[0],
      data[2].map((e) => e[0].shuushokugocode)
    );
    selected.set(null);
  }

  function doCancel(): void {
    selected.set(null);
  }
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
        <div class="date-wrapper end-date">
          <DateFormWithCalendar
            bind:date={endDate}
            bind:errors={endDateErrors}
            isNullable={false}
            {gengouList}
          />
        </div>
        <div class="end-reason">
          {#each Object.values(DiseaseEndReason) as reason}
            {@const id = genid()}
            <input type="radio" bind:group={endReason} value={reason} {id} />
            <label for={id}>{reason.label}</label>
          {/each}
        </div>
        <div>
          <button on:click={doEnter}>入力</button>
          <a href="javascript:void(0)" on:click={doCancel}>キャンセル</a>
        </div>
        <SearchForm selected={searchSelect} bind:startDate />
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

  .select {
    height: 5em;
    overflow-y: auto;
  }
</style>
