<script lang="ts">
  import type { Patient, Visit } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { pad } from "./pad";
  import SelectItem from "./SelectItem.svelte";
  import SurfaceModal from "./SurfaceModal.svelte";
  import * as kanjidate from "kanjidate";
  import api from "./api";

  export let destroy: () => void;
  export let title: string;
  export let onEnter: (item: [Visit, Patient]) => void;
  export let enterButton: string = "選択";
  let result: [Visit, Patient][] = [];
  let selected: Writable<[Visit, Patient] | undefined> = writable(undefined);
  let page: Writable<number> = writable(0);
  let itemsPerPage: number = 10;

  page.subscribe(init);

  async function init(page: number) {
    result = await api.listRecentVisitFull(itemsPerPage * page, itemsPerPage);
  }

  function doEnter(): void {
    if( $selected != undefined ){
      destroy();
      onEnter($selected);
    }
  }

  function gotoFirst(): void {
    page.set(0);
  }

  function gotoPrev(): void {
    if( $page > 0 ){
      page.set($page - 1);
    }
  }

  function gotoNext(): void {
    page.set($page + 1);
  }
</script>

<SurfaceModal {destroy} {title}>
  <div class="nav">
    <a href="javascript:void(0)" on:click={gotoFirst}>最初へ</a> |
    <a href="javascript:void(0)" on:click={gotoPrev}>前へ</a> |
    <a href="javascript:void(0)" on:click={gotoNext}>次へ</a>
  </div>
  <div class="result">
    {#each result as item (item[0].visitId)}
      {@const visit = item[0]}
      {@const patient = item[1]}
      <SelectItem {selected} data={item}>
        ({pad(patient.patientId, 4, "0")}) {patient.fullName()}
        {kanjidate.format(kanjidate.f2, visit.visitedAt)}
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
