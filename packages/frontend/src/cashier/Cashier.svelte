<script lang="ts">
  import { wqueueDeleted, wqueueEntered, wqueueUpdated } from "@/app-events";
  import api from "@/lib/api";
  import type { Wqueue } from "myclinic-model";
  import { onDestroy } from "svelte";
  import TopBlock from "./TopBlock.svelte";
  import { WqueueData } from "./wq-data";
  import WqTable from "./WqTable.svelte";
  import type { EventEmitter } from "@/lib/event-emitter";
  import { writable, type Writable } from "svelte/store";

  // export let wqItems: WqueueData[] = [];
  let wqItems: Writable<WqueueData[]> = writable([]);
  export let hotlineTrigger: EventEmitter<string> | undefined = undefined;
  export let isAdmin: boolean = false;
  let unsubs: (() => void)[] = [];

  onDestroy(() => unsubs.forEach((f) => f()));

  refresh();

  unsubs.push(
    wqueueEntered.subscribe(async (wq) => {
      refresh();
      if (wq == null) {
        return;
      }
    })
  );

  unsubs.push(
    wqueueUpdated.subscribe(async (wq) => {
      refresh();
      if (wq == null) {
        return;
      }
    })
  );

  unsubs.push(
    wqueueDeleted.subscribe(async (wq) => {
      refresh();
      if (wq == null) {
        return;
      }
    })
  );


  async function refresh() {
    const curr = (await api.listWqueueFull()).map((r) => new WqueueData(...r));
    wqItems.set(curr);
  }
</script>

<div>
  <TopBlock {hotlineTrigger} {isAdmin} />
  <WqTable items={wqItems} {isAdmin} />
  <button on:click={refresh}>更新</button>
</div>
