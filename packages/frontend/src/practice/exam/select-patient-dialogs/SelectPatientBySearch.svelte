<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type * as m from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "@/lib/api";
  import { dateTimeToSql } from "@/lib/util";
  import { pad } from "@/lib/pad";
  import { tick } from "svelte";

  export let destroy: () => void;
  export let onEnter: (patient: m.Patient, visitId?: number) => void;
  export let showRegisterButton = true;
  let selected: Writable<m.Patient | null> = writable(null);
  let patients: Array<m.Patient> = [];
  let searchText: string = "";
  let selectButton: HTMLElement;

  async function doSearch(ev: Event) {
    ev.preventDefault();
    const t = searchText.trim();
    selected.set(null);
    patients = await api.searchPatient(t);
    if (patients.length > 0) {
      selected.set(patients[0]);
      await tick();
      selectButton.focus();
    }
  }

  function onSelectButtonClick(): void {
    if ($selected) {
      onEnter($selected, undefined);
      destroy();
    }
  }

  function findCurrentIndex(): number | undefined {
    if( $selected ){
      const patientId = $selected.patientId;
      const i = patients.findIndex(p => p.patientId === patientId);
      return i >= 0 ? i : undefined;
    } else {
      return undefined;
    }
  }

  async function onRegisterButtonClick() {
    if ($selected) {
      const now = dateTimeToSql(new Date());
      const visit = await api.startVisit($selected.patientId, now);
      onEnter($selected, visit.visitId);
      destroy();
    }
  }

  function setFocus(input: HTMLInputElement) {
    input.focus();
  }

  function doKeydown(e: KeyboardEvent): void {
    if( e.key === "ArrowDown" ){
      e.preventDefault();
      const i = findCurrentIndex();
      if( i !== undefined && i < patients.length - 1 ){
        selected.set(patients[i+1]);
      }
    } else if( e.key === "ArrowUp" ){
      e.preventDefault();
      const i = findCurrentIndex();
      if( i !== undefined && i > 0 ){
        selected.set(patients[i-1]);
      }
    }
  }

</script>

<Dialog {destroy} title="患者検索">
  <div class="top">
    <form on:submit={doSearch}>
      <input
        type="text"
        bind:value={searchText}
        use:setFocus
        data-cy="search-text-input"
        on:keydown={doKeydown}
      /> <button>検索</button>
    </form>
    <div class="select">
      {#each patients as patient}
        <SelectItem {selected} data={patient} eqData={(a, b) => a.patientId === b.patientId}
          autoIntoView={true}>
          <span data-cy="patient-item" data-patient-id={patient.patientId}>
            ({pad(patient.patientId, 4, "0")})
            {patient.lastName}
          {patient.firstName}</span>
        </SelectItem>
      {/each}
    </div>
  </div>
  <div class="commands">
    {#if showRegisterButton}
    <button on:click={onRegisterButtonClick} disabled={$selected == null}
      >診察登録</button>
    {/if}
    <button on:click={onSelectButtonClick} disabled={$selected == null} bind:this={selectButton}
      on:keydown={doKeydown}
      >選択</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .top button:focus {
    outline: solid;
  }

  form {
    margin-bottom: 6px;
  }

  .select {
    height: 100px;
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
