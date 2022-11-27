<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import {
    ByoumeiMaster,
    DiseaseEndReason,
    DiseaseExample,
    ShuushokugoMaster,
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
  import api from "@/lib/api";

  export let list: DiseaseData[];
  export let init: DiseaseData | null;

  $: diseaseDataSelected.set(init);

  let data: EditData | undefined = undefined;

  let name: string;
  let searchSelect: Writable<SearchResultType | null> = writable(null);
  let diseaseDataSelected: Writable<DiseaseData | null> = writable(null);

  searchSelect.subscribe(async (sel) => {
    if (data != undefined && data.startDate != null) {
      if (ByoumeiMaster.isByoumeiMaster(sel)) {
        data.byoumeiMaster = sel;
        name = data.fullName;
      } else if (ShuushokugoMaster.isShuushokugoMaster(sel)) {
        data.addToShuushokugoList(sel);
        name = data.fullName;
      } else if (DiseaseExample.isDiseaseExample(sel)) {
        const [b, as] = await resolveDiseaseExample(sel, data.startDate);
        if (b != null) {
          data.byoumeiMaster = b;
        }
        data.addToShuushokugoList(...as);
      }
      searchSelect.set(null);
    }
  });

  function clearData(): void {
    data = undefined;
    name = "";
    searchSelect.set(null);
  }

  function setData(dd: DiseaseData): void {
    data = new EditData(dd);
    name = data.fullName;
    console.log("name", name);
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
    const errors: string[] = [];
    const disease = data.unwrapDisease(errors);
    if( errors.length > 0 ){
      alert(errors.join("\n"));
      return;
    }
    if( disease.endReason == DiseaseEndReason.NotEnded ){
      disease.clearEndDate();
    }
    await api.updateDiseaseEx(
      disease,
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
            bind:date={data.startDate}
            bind:errors={data.startDateErrors}
            {gengouList}
          />
        </div>
        <div class="date-wrapper end-date">
          <DateFormWithCalendar
            bind:date={data.endDate}
            bind:errors={data.endDateErrors}
            isNullable={false}
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
  <div class="list select">
    {#each list as data}
      <SelectItem selected={diseaseDataSelected} {data}>
        <span class="disease-name" class:hasEnd={data.hasEndDate}
          >{data.fullName}</span
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
