<script type="ts">
  import Dialog from "../../../lib/DialogOld.svelte";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "../../../lib/api";
  import {
    WqueueState,
    WqueueStateType,
    type Patient,
    type Visit,
    type Wqueue,
  } from "myclinic-model";

  let entries: [Wqueue, Visit, Patient][] = [];
  let selected: Writable<[Wqueue, Visit, Patient] | null> = writable(null);

  function onClose(): void {
    selected.set(null);
    entries = [];
  }

  export let onEnter: (patient: Patient, visitId: number | undefined) => void;
  let dialog: Dialog;

  export async function open() {
    const list = await api.listWqueueFull();
    entries = list.filter((d) => {
      const state = WqueueStateType.fromCode(d[0].waitState);
      console.log("state", state);
      return (
        state == WqueueState.WaitExam ||
        state == WqueueState.WaitReExam ||
        state == WqueueState.InExam
      );
    });
    if( entries.length > 0 ){
      selected.set(entries[0]);
    }
    dialog.open();
  }

  function enter(close: () => void) {
    if ($selected) {
      const [_, visit, patient] = $selected;
      onEnter(patient, visit.visitId);
      close();
    }
  }
</script>

<Dialog let:close bind:this={dialog} {onClose}>
  <span slot="title" class="title">受付患者選択</span>

  {#if entries.length > 0}
  <div class="select">
    {#each entries as data}
      <SelectItem {data} {selected}>
        {@const [_wq, _visit, patient] = data}
        <span>{patient.lastName}{patient.firstName}</span>
      </SelectItem>
    {/each}
  </div>
  {:else}
    <div>（受付患者なし）</div>
  {/if}
  <svelte:fragment slot="commands">
    <button on:click={() => enter(close)} disabled={$selected == null}
      >選択</button
    >
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>
