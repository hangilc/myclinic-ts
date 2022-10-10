<script type="ts">
  import Dialog from "../../../lib/Dialog.svelte";
  import SelectItem from "../../../lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "../../../lib/api";
  import type * as m from "../../../lib/model";

  export let onEnter: (patient: m.Patient, visitId: number | null) => void;
  export let onClose: () => void;

  let selected: Writable<[m.Wqueue, m.Visit, m.Patient] | null> = writable(null);

  function enter() {
    if( $selected ){
      const [wq, visit, patient] = $selected;
      onEnter(patient, visit.visitId);
      onClose();
    }
  }

</script>

<Dialog onClose={onClose}>
  <span slot="title" class="title">受付患者選択</span>
  {#await api.listWqueueFull()}
    <div>Loading...</div>
  {:then dataList}
    <div class="select">
      {#each dataList as data}
        <SelectItem data={data} selected={selected}>
          {@const [wq, visit, patient] = data}
          <span>{patient.lastName}{patient.firstName}</span>
        </SelectItem>
      {/each}
    </div>
  {:catch error}
    <div style="color: red">Error</div>
  {/await}
  <div slot="commands" class="commands">
    <button on:click={enter} disabled={$selected == null}>選択</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</Dialog>
