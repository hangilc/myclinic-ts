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
  export let wqItems: Writable<WqueueData[]> = writable([]);
  export let hotlineTrigger: EventEmitter<string> | undefined = undefined;
  export let isAdmin: boolean = false;
  let unsubs: (() => void)[] = [];

  onDestroy(() => unsubs.forEach((f) => f()));

  refresh();

  unsubs.push(
    wqueueEntered.subscribe(async (wq) => {
      if (wq == null) {
        return;
      }
      let data = await getWqueueData(wq);
      wqItems.update((wqItems) => [...wqItems, data]);
    })
  );

  unsubs.push(
    wqueueUpdated.subscribe(async (wq) => {
      if (wq == null) {
        return;
      }
      const wqData = await getWqueueData(wq);
      wqItems.update((wqItems) => {
        console.log("before", wqItems);
        const updated = wqItems.map((item) => {
          if (item.visitId === wq.visitId) {
            return wqData;
          } else {
            return item;
          }
        });
        console.log("after", updated);
        return updated;
      });
    })
  );

  unsubs.push(
    wqueueDeleted.subscribe(async (wq) => {
      if (wq == null) {
        return;
      }
      wqItems.update((wqItems) =>
        wqItems.filter((item) => item.visitId !== wq.visitId)
      );
    })
  );

  async function getWqueueData(wq: Wqueue): Promise<WqueueData> {
    let visit = await api.getVisit(wq.visitId);
    let patient = await api.getPatient(visit.patientId);
    return new WqueueData(wq, visit, patient);
  }

  async function refresh() {
    const curr = (await api.listWqueueFull()).map((r) => new WqueueData(...r));
    console.log("refresh", curr);
    wqItems.set(curr);
    // wqItems = (await api.listWqueueFull()).map((r) => new WqueueData(...r));
  }
</script>

<div>
  <TopBlock {hotlineTrigger} {isAdmin} />
  <WqTable items={wqItems} {isAdmin} />
  <button on:click={refresh}>更新</button>
</div>
