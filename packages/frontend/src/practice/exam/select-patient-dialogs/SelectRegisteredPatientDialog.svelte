<script type="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "../../../lib/api";
  import {
    WqueueState,
    type Patient,
    type Visit,
    type Wqueue,
  } from "myclinic-model";

  let entries: [Wqueue, Visit, Patient][] = [];
  let selected: Writable<[Wqueue, Visit, Patient] | null> =
    writable(null);

  function onClose(): void {
    selected.set(null);
    entries = [];
  }

  export let onEnter: (patient: Patient, visitId: number | undefined) => void;
  let dialog: Dialog;

  export async function open() {
    const list = await api.listWqueueFull();
    entries = list.filter((d) => {
      const state = d[0].waitState;
      return state == WqueueState.WaitExam || state == WqueueState.WaitReExam;
    });
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

  <div class="select">
    {#each entries as data}
      <SelectItem {data} {selected} autoselect>
        {@const [_wq, _visit, patient] = data}
        <span>{patient.lastName}{patient.firstName}</span>
      </SelectItem>
    {/each}
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => enter(close)} disabled={$selected == null}
      >選択</button
    >
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>
