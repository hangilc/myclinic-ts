<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type * as m from "myclinic-model";
  import api from "@/lib/api";
  import { padNumber } from "@/lib/util";
  
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { FormatDate } from "myclinic-util";

  export let destroy: () => void;
  export let onEnter: (patient: m.Patient, visitId?: number) => void;

  const itemsPerPage = 30;
  let page: number = 0;
  const selected: Writable<[m.Patient, m.Visit] | null> = writable(null);

  function onEnterClick(): void{
    if( $selected ){
      onEnter($selected[0]);
      destroy();
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
<Dialog {destroy} title="最近の診察">
  {#await api.listRecentVisitFull(page * itemsPerPage, itemsPerPage)}
    <div>Loading...</div>
  {:then visits}
    <div class="select">
      {#each visits as visitFull}
        {@const [visit, patient] = visitFull}
        <SelectItem selected={selected} data={[patient, visit]}>
          {padNumber(patient.patientId, 4)} 
          {patient.lastName}{patient.firstName}
          {FormatDate.f1(patient.birthday)}
        </SelectItem>
      {/each}
    </div>
    <div class="nav">
      <a href="javascript:void(0)" on:click={onPrevClick}>前へ</a>
      <a href="javascript:void(0)" on:click={onNextClick}>次へ</a>
    </div>
  {:catch error}
    <div style:color="red">Error: {error.toString()}</div>
  {/await}
  <div class="commands">
    <button on:click={onEnterClick} disabled={$selected === null}>選択</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .select {
    width: 360px;
    height: 300px;
  }

  .nav {
    margin: 10px 0;
  }

    .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 4px;
    line-height: 1;
    }
  
    .commands * + * {
    margin-left: 4px;
    }
</style>