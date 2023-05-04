<script type="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "@/lib/api";
  import {
    WqueueState,
    WqueueStateType,
    type Patient,
    type Visit,
    type Wqueue,
  } from "myclinic-model";

  export let destroy: () => void;
  let entries: [Wqueue, Visit, Patient][] = [];
  let selected: Writable<[Wqueue, Visit, Patient] | null> = writable(null);

  init();

  export let onEnter: (patient: Patient, visitId: number | undefined) => void;

  async function init() {
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
    if (entries.length > 0) {
      selected.set(entries[0]);
    }
  }

  function enter() {
    if ($selected) {
      const [_, visit, patient] = $selected;
      onEnter(patient, visit.visitId);
      destroy();
    }
  }
</script>

<Dialog {destroy} title="受付患者選択">
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
  <div class="commands">
    <button on:click={enter} disabled={$selected == null}>選択</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .select {
    width: 16rem;
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
