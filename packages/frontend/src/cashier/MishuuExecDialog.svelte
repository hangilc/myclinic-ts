<script lang="ts">
  import { genid } from "@/lib/genid";
  import Dialog from "@/lib/Dialog.svelte";
  import { Wqueue, WqueueState, type Patient, type Visit } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import MishuuDialog from "./MishuuDialog.svelte";
  import api from "@/lib/api";

  export let destroy: () => void;
  export let patient: Patient;
  export let list: [Visit, number][];
  export let selected: number[] = list.map(item => item[0].visitId);

  function doBack(): void {
    destroy();
    const d: MishuuDialog = new MishuuDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }

  async function doEnter() {
    let wqList = await api.listWqueue();
    function inWqueue(visitId: number): boolean {
      return wqList.findIndex(wq => wq.visitId === visitId) >= 0;
    }
    let promises = selected.map(visitId => {
      let wq = new Wqueue(visitId, WqueueState.WaitCashier.code);
      if( inWqueue(visitId) ){
        return api.updateWqueue(wq);
      } else {
        return api.enterWqueue(wq);
      }
    })
    await Promise.all(promises);
    destroy();
  }
</script>

<Dialog {destroy} title="未収処理">
  <div>
    ({patient.patientId}) {patient.fullName()}
  </div>
  <div class="list">
    {#each list as item (item[0].visitId)}
      {@const visit=item[0]}
      {@const charge=item[1]}
      {@const id=genid()}
      <div>
        <input type="checkbox" id={id} bind:group={selected} value={visit.visitId}
          data-visit-id={visit.visitId}/>
        {kanjidate.format(kanjidate.f2, visit.visitedAt)}
        {charge.toLocaleString()}円
      </div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={selected.length === 0}>会計に加える</button>
    <button on:click={doBack}>検索に戻る</button>
  </div>
</Dialog>

<style>
  .list {
    margin: 10px 0;
  }

  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>