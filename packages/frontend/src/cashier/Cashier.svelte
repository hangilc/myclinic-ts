<script lang="ts">
  import api from "@/lib/api";
  import type { Patient, Visit, Wqueue } from "myclinic-model";
  import TopBlock from "./TopBlock.svelte";
  import WqTable from "./WqTable.svelte";

  export let wqItems: [Wqueue, Visit, Patient][] = [];

  refresh();

  async function refresh() {
    wqItems = await api.listWqueueFull();
  }
</script>

<div>
  <TopBlock />
  <WqTable items={wqItems}/>
  <button on:click={refresh}>更新</button>
</div>
