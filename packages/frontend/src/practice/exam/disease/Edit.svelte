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
  } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import {
    resolveDiseaseExample,
    EditData,
    type SearchResultType,
    startDateRep,
    endDateRep,
  } from "./types";
  import SearchForm from "./SearchForm.svelte";
  import { dateToSql } from "@/lib/util";
  import api from "@/lib/api";

  export let list: DiseaseData[];

  let data: EditData | undefined = undefined;

  let name: string;
  let startDate: Date | null = null;
  let startDateErrors: string[] = [];
  let endDate: Date | null = null;
  let endDateErrors: string[] = [];
  let endReason: DiseaseEndReasonType = DiseaseEndReason.NotEnded;
  let searchSelect: Writable<SearchResultType | null> = writable(null);
  let diseaseDataSelected: Writable<DiseaseData | null> = writable(null);

  searchSelect.subscribe(async (sel) => {
    if (data != undefined && startDate != null) {
      if (ByoumeiMaster.isByoumeiMaster(sel)) {
        data.setByoumeiMaster(sel);
        name = data.fullName;
      } else if (ShuushokugoMaster.isShuushokugoMaster(sel)) {
        data.addToShuushokugoList(sel);
        name = data.fullName;
      } else if (DiseaseExample.isDiseaseExample(sel)) {
        const [b, as] = await resolveDiseaseExample(sel, startDate);
        if (b != null) {
          data.setByoumeiMaster(b);
        }
        data.addToShuushokugoList(...as);
      }
    }
  });

  function clearData(): void {
    data = undefined;
    name = "";
    startDate = null;
    startDateErrors = [];
    endDate = null;
    endDateErrors = [];
    endReason = DiseaseEndReason.NotEnded;
    searchSelect.set(null);
  }

  function setData(dd: DiseaseData): void {
    data = new EditData(dd);
    name = data.fullName;
    startDate = data.startDate;
    startDateErrors = [];
    endDate = data.endDate ?? null;
    endDateErrors = [];
    endReason = data.endReason;
    searchSelect.set(null);
  }

  diseaseDataSelected.subscribe((dd) => {
    if (dd == null) {
      clearData();
    } else {
      setData(dd);
    }
  });

  const gengouList = ["平成", "令和"];

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

  async function doEnter() {
    if (data == null) {
      return;
    }
    if (startDate == null) {
      alert("エラー：開始日が設定されていません。");
      return;
    }
    data.setStartDate(startDate);
    data.setEndDate(endDate ?? undefined);
    data.setEndReason(endReason);
    if (data.endReason === DiseaseEndReason.NotEnded) {
      data.setEndDate(undefined);
    }
    if (
      !(
        data.disease.endDate === "0000-00-00" ||
        data.disease.startDate <= data.disease.endDate
      )
    ) {
      alert("エラー：開始日が終了日の後です。");
      return;
    }
    await api.updateDiseaseEx(
      data.disease,
      data.shuushokugocodes
    );
    clearData();
  }

  function doCancel(): void {
    clearData();
  }
</script>

<div>
  <div>
    {#if data != undefined}
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
