<script lang="ts">
  import { wqueueEntered } from "@/app-events";
  import api from "@/lib/api";
  import type { Patient, Visit, Wqueue } from "myclinic-model";
  import TopBlock from "./TopBlock.svelte";
  import WqTable from "./WqTable.svelte";

  export let wqItems: [Wqueue, Visit, Patient][] = [];
  let unsubs: (() => void)[] = [];

  refresh();

  unsubs.push(wqueueEntered.subscribe(async (wq) => {
    if( wq == null ){
      return;
    }
    let visit = await api.getVisit(wq.visitId);
    let patient = await api.getPatient(visit.patientId);
    let item: [Wqueue, Visit, Patient] = [wq, visit, patient];
    wqItems = [...wqItems, item];
  }));

  async function refresh() {
    wqItems = await api.listWqueueFull();
  }
</script>

<div>
  <TopBlock />
  <WqTable items={wqItems}/>
  <button on:click={refresh}>更新</button>
</div>
