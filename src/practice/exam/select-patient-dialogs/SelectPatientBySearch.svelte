<script lang="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import type * as m from "../../../lib/model";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import api from "../../../lib/api";
  import { dateTimeToSql } from "../../../lib/util"

  export let onClose: () => void;
  export let onEnter: (patient: m.Patient, visitId: number | null) => void;

  let selected: Writable<m.Patient | null> = writable(null);
  let patients: Array<m.Patient> = [];
  let input: HTMLInputElement;

  onMount(() => {
    input.focus();
  });

  async function doSearch(ev: Event){
    ev.preventDefault();
    const t = input.value.trim()
    patients = await api.searchPatient(t);
    console.log(patients);
  }

  function onSelectButtonClick() {
    if( $selected ){
      onEnter($selected, null);
      onClose();
    }
  }

  async function onRegisterButtonClick() {
    if( $selected ){
      const now = dateTimeToSql(new Date());
      const visit = await api.startVisit($selected.patientId, now);
      onEnter($selected, visit.visitId);
      onClose();
    }
  }

</script>

<Dialog onClose={onClose}>
  <span slot="title" class="title">患者検索</span>
  <div>
    <form on:submit={doSearch}>
      <input type="text" bind:this={input}/> <button>検索</button>
    </form>
    <div class="select">
      {#each patients as patient}
        <SelectItem selected={selected} data={patient}>
          {patient.lastName} {patient.firstName}
        </SelectItem>
      {/each}
    </div>
  </div>
  <div slot="commands" class="commands">
    <button on:click={onRegisterButtonClick} disabled={$selected == null}>診察登録</button>
    <button on:click={onSelectButtonClick} disabled={$selected == null}>選択</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  form {
    margin-bottom: 6px;
  }

  .select {
    height: 100px;
  }
</style>

