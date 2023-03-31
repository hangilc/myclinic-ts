<script lang="ts">
  import type { Patient, Visit } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import api from "./api";
  import EditableDate from "./editable-date/EditableDate.svelte";
  import { pad } from "./pad";
  import SelectItem from "./SelectItem.svelte";
  import SurfaceModal from "./SurfaceModal.svelte";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let title: string;
  export let onEnter: (visit: Visit, patient: Patient) => void;
  export let enterButton: string = "選択";
  let result: [Visit, Patient][] = [];
  let selected: Writable<[Visit, Patient] | undefined> = writable(undefined);
  let date: Writable<Date> = writable(new Date());

  date.subscribe(init);

  async function init(date: Date) {
    let visits = await api.listVisitByDate(date);
    let map = await api.batchGetPatient(visits.map(v => v.patientId));
    result = visits.map(visit => {
      return [visit, map[visit.patientId]];
    })
  }

  function doEnter() {
    if( $selected != undefined ){
      let [visit, patient] = $selected;
      destroy();
      onEnter(visit, patient);
    }
  }

  function doChange(dateArg: Date | null): void {
    console.log("doChange", dateArg);
    if( dateArg != null ){
      date.set(dateArg);
    }
  }

  function doToday(): void {
    date.set(new Date());
  }

  function doPrev(): void {
    let newDate = kanjidate.addDays($date, -1);
    date.set(newDate);
  }

  function doNext(): void {
    let newDate = kanjidate.addDays($date, 1);
    date.set(newDate);
  }
</script>

<SurfaceModal {destroy} {title}>
  <div class="date">
    <EditableDate date={$date} onChange={() => doChange($date)}/>
  </div>
  <div>
    <a href="javascript:void(0)" on:click={doToday}>今日</a> |
    <a href="javascript:void(0)" on:click={doPrev}>前へ</a> |
    <a href="javascript:void(0)" on:click={doNext}>次へ</a>
  </div>
  <div class="result">
    {#each result as item (item[0].visitId)}
      {@const visit = item[0]}
      {@const patient = item[1]}
      <SelectItem {selected} data={item}>
        ({pad(patient.patientId, 4, "0")}) {patient.fullName()}
      </SelectItem>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={$selected == undefined}
      >{enterButton}</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .date {
    display: flex;
  }

  .result {
    height: 10rem;
    width: 18rem;
    resize: vertical;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid gray;
    padding: 6px;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin: 10px 0 6px 0;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
