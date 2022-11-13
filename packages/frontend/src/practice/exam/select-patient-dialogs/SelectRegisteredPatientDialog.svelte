<script type="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "../../../lib/api";
  import type * as m from "myclinic-model";

  export let onEnter: (patient: m.Patient, visitId: number | null) => void;
  let dialog: Dialog;
  export function open(): void {
    dialog.open();
  }

  let selected: Writable<[m.Wqueue, m.Visit, m.Patient] | null> = writable(null);

  function enter(close: () => void) {
    if( $selected ){
      const [_, visit, patient] = $selected;
      onEnter(patient, visit.visitId);
      close();
    }
  }

</script>

<Dialog let:close={close} bind:this={dialog}>
  <span slot="title" class="title">受付患者選択</span>
  {#await api.listWqueueFull()}
    <div>Loading...</div>
  {:then dataList}
    <div class="select">
      {#each dataList as data}
        <SelectItem data={data} selected={selected}>
          {@const [_wq, _visit, patient] = data}
          <span>{patient.lastName}{patient.firstName}</span>
        </SelectItem>
      {/each}
    </div>
  {:catch}
    <div style="color: red">Error</div>
  {/await}
  <svelte:fragment slot="commands">
    <button on:click={() => enter(close)} disabled={$selected == null}>選択</button>
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>
