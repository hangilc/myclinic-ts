<script lang="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import type * as m from "../../../lib/model";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import api from "../../../lib/api";
  import { dateTimeToSql } from "../../../lib/util"

  let dialog: Dialog;
  let input: HTMLInputElement;
  export function open(): void {
    dialog.open();
    console.log(input);
  }
  export let onEnter: (patient: m.Patient, visitId: number | null) => void;

  let selected: Writable<m.Patient | null> = writable(null);
  let patients: Array<m.Patient> = [];

  onMount(() => {
    console.log("input", input);
    // input.focus();
  });

  async function doSearch(ev: Event){
    ev.preventDefault();
    const t = input.value.trim()
    patients = await api.searchPatient(t);
    console.log(patients);
  }

  function onSelectButtonClick(close: () => void): void {
    if( $selected ){
      onEnter($selected, null);
      close();
    }
  }

  async function onRegisterButtonClick(close: () => void) {
    if( $selected ){
      const now = dateTimeToSql(new Date());
      const visit = await api.startVisit($selected.patientId, now);
      onEnter($selected, visit.visitId);
      close();
    }
  }

</script>

<Dialog let:close={close} bind:this={dialog}>
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
    <button on:click={() => onRegisterButtonClick(close)} disabled={$selected == null}>診察登録</button>
    <button on:click={() => onSelectButtonClick(close)} disabled={$selected == null}>選択</button>
    <button on:click={() => close()}>キャンセル</button>
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

