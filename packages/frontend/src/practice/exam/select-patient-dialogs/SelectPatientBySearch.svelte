<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type * as m from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "@/lib/api";
  import { dateTimeToSql } from "@/lib/util";

  export let destroy: () => void;
  export let onEnter: (patient: m.Patient, visitId?: number) => void;
  let selected: Writable<m.Patient | null> = writable(null);
  let patients: Array<m.Patient> = [];
  let searchText: string;

  function onClose(): void {
    selected.set(null);
    patients = [];
    searchText = "";
  }

  async function doSearch(ev: Event) {
    ev.preventDefault();
    const t = searchText.trim();
    selected.set(null);
    patients = await api.searchPatient(t);
    if (patients.length > 0) {
      selected.set(patients[0]);
    }
  }

  function onSelectButtonClick(): void {
    if ($selected) {
      onEnter($selected, undefined);
      destroy();
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
</script>

<Dialog {destroy} title="患者検索">
  <div>
    <form on:submit={doSearch}>
      <input
        type="text"
        bind:value={searchText}
        use:setFocus
        data-cy="search-text-input"
      /> <button>検索</button>
    </form>
    <div class="select">
      {#each patients as patient}
        <SelectItem {selected} data={patient}>
          <span data-cy="patient-item" data-patient-id={patient.patientId}>{patient.lastName}
          {patient.firstName}</span>
        </SelectItem>
      {/each}
    </div>
  </div>
  <div class="commands">
    <button on:click={onRegisterButtonClick} disabled={$selected == null}
      >診察登録</button
    >
    <button on:click={onSelectButtonClick} disabled={$selected == null}
      >選択</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
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
