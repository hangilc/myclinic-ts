<script lang="ts">
  import Dialog from "../../../lib/DialogOld.svelte";
  import type * as m from "myclinic-model";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "../../../lib/api";
  import { dateTimeToSql } from "../../../lib/util"

  export let onEnter: (patient: m.Patient, visitId?: number) => void;
  let dialog: Dialog;
  let selected: Writable<m.Patient | null> = writable(null);
  let patients: Array<m.Patient> = [];
  let searchText: string;

  function onClose(): void {
    selected.set(null);
    patients = [];
    searchText = "";
  }

  export function open(): void {
    selected.set(null);
    patients = [];
    searchText = "";
    dialog.open();
  }

  async function doSearch(ev: Event){
    ev.preventDefault();
    const t = searchText.trim()
    selected.set(null);
    patients = await api.searchPatient(t);
    if( patients.length > 0 ){
      selected.set(patients[0]);
    }
  }

  function onSelectButtonClick(close: () => void): void {
    if( $selected ){
      onEnter($selected, undefined);
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

  function setFocus(input: HTMLInputElement){
    input.focus();
  }

</script>

<Dialog let:close={close} bind:this={dialog} {onClose}>
  <span slot="title" class="title">患者検索</span>
  <div>
    <form on:submit={doSearch}>
      <input type="text" bind:value={searchText} use:setFocus/> <button>検索</button>
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

