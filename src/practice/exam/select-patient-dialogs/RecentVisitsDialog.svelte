<script lang="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import type * as m from "../../../lib/model";
  import api from "../../../lib/api";
  import { padNumber } from "../../../lib/util";
  import * as kanjidate from "kanjidate";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  export let onClose: () => void;
  export let onEnter: (patient: m.Patient, visitId: number | null) => void;

  const itemsPerPage = 30;
  let page: number = 0;
  const selected: Writable<[m.Patient, m.Visit] | null> = writable(null);

  function onEnterClick(){
    if( $selected ){
      onEnter($selected[0], null);
      onClose();
    }
  }

  function onPrevClick(){
    if( page > 0 ){
      page = page - 1;
    }
  }

  function onNextClick(){
    page = page + 1;
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog onClose={onClose} width="360px">
  <span slot="title" class="title">最近の診察</span>
  {#await api.listRecentVisitFull(page * itemsPerPage, itemsPerPage)}
    <div>Loading...</div>
  {:then visits}
    <div class="select">
      {#each visits as visitFull}
        {@const [visit, patient] = visitFull}
        <SelectItem selected={selected} data={[patient, visit]}>
          {padNumber(patient.patientId, 4)} 
          {patient.lastName}{patient.firstName}
          {kanjidate.format(kanjidate.f1, patient.birthday)}
        </SelectItem>
      {/each}
    </div>
    <div>
      <a href="javascript:void(0)" on:click={onPrevClick}>前へ</a>
      <a href="javascript:void(0)" on:click={onNextClick}>次へ</a>
    </div>
  {:catch error}
    <div style:color="red">Error: {error.toString()}</div>
  {/await}
  <div slot="commands" class="commands">
    <button on:click={onEnterClick} disabled={$selected === null}>選択</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .select {
    height: 300px;
  }
</style>