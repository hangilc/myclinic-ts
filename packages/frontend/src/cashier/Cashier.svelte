<script lang="ts">
  import { wqueueDeleted, wqueueEntered, wqueueUpdated } from "@/app-events";
  import api from "@/lib/api";
  import type { Wqueue } from "myclinic-model";
  import { onDestroy } from "svelte";
  import TopBlock from "./TopBlock.svelte";
  import { WqueueData } from "./wq-data";
  import WqTable from "./WqTable.svelte";
  import type { EventEmitter } from "@/lib/event-emitter";

  export let wqItems: WqueueData[] = [];
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
      wqItems = [...wqItems, data];
    })
  );

  unsubs.push(
    wqueueUpdated.subscribe(async (wq) => {
      if (wq == null) {
        return;
      }
      let item = await getWqueueData(wq);
      const tmp = wqItems;
      let i = tmp.findIndex((d) => d.visitId == wq.visitId);
      if (i >= 0) {
        tmp.splice(i, 1, item);
        wqItems = tmp;
      }
    })
  );

  unsubs.push(
    wqueueDeleted.subscribe(async (wq) => {
      if (wq == null) {
        return;
      }
      let i = wqItems.findIndex((d) => d.visitId == wq.visitId);
      if (i >= 0) {
        const tmp = wqItems;
        tmp.splice(i, 1);
        wqItems = tmp;
      }
    })
  );

  async function getWqueueData(wq: Wqueue): Promise<WqueueData> {
    let visit = await api.getVisit(wq.visitId);
    let patient = await api.getPatient(visit.patientId);
    return new WqueueData(wq, visit, patient);
  }

  async function refresh() {
    wqItems = (await api.listWqueueFull()).map(r => new WqueueData(...r));
  }
</script>

<div>
  <TopBlock {hotlineTrigger} {isAdmin} />
  <WqTable items={wqItems} />
  <button on:click={refresh}>更新</button>
</div>
