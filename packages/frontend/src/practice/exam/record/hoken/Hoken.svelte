<script lang="ts">
  import type { VisitEx, Shahokokuho, Koukikourei, Kouhi, Roujin } from "@/lib/model"
  import { hokenRep, shahokokuhoRep, roujinRep, koukikoureiRep, kouhiRep } from "@/lib/hoken-rep"
  import Dialog from "@/lib/Dialog.svelte"
  import api from "@/lib/api"

  export let visit: VisitEx;
  let dialog: Dialog;
  let shahoOpt: [Shahokokuho, boolean] | null = null;
  let roujinOpt: [Roujin, boolean] | null = null;
  let koukiOpt: [Koukikourei, boolean] | null = null;
  let kouhiList: [Kouhi, boolean][] = [];

  async function onDispClick() {
    const patientId = visit.patient.patientId;
    const at = new Date(visit.visitedAt);
    shahoOpt = await resolveShahokokuho(patientId, at);
    roujinOpt = await resolveRoujin(patientId, at);
    koukiOpt = await resolveKoukikourei(patientId, at);
    kouhiList = await resolveKouhiList(patientId, at);
    dialog.open();
  }

  async function resolveShahokokuho(patientId: number, at: Date): 
      Promise<[Shahokokuho, boolean] | null> {
    const shaho = await api.findAvailableShahokokuho(patientId, at);
    if( shaho == null ){
      return null;
    } else {
      console.log(visit.hoken);
      console.log([shaho, visit.hoken.shahokokuho?.shahokokuhoId === shaho.shahokokuhoId]);
      return [shaho, visit.hoken.shahokokuho?.shahokokuhoId === shaho.shahokokuhoId];
    }
  }

  async function resolveRoujin(patientId: number, at: Date): 
      Promise<[Roujin, boolean] | null> {
    const hoken = await api.findAvailableRoujin(patientId, at);
    if( hoken == null ){
      return null;
    } else {
      return [hoken, visit.hoken.roujin?.roujinId === hoken.roujinId];
    }
  }

  async function resolveKoukikourei(patientId: number, at: Date): 
      Promise<[Koukikourei, boolean] | null> {
    const hoken = await api.findAvailableKoukikourei(patientId, at);
    if( hoken == null ){
      return null;
    } else {
      return [hoken, visit.hoken.koukikourei?.koukikoureiId === hoken.koukikoureiId];
    }
  }

  async function resolveKouhiList(patientId: number, at: Date):
      Promise<([Kouhi, boolean])[]> {
    const kouhiList = await api.listAvailableKouhi(patientId, at);
    return kouhiList.map(k => [
      k,
      visit.hoken.kouhiList.findIndex(kouhi => kouhi.kouhiId === k.kouhiId) >= 0
    ])
  }

  function selectedShahokokuhoId(): number {
    if( shahoOpt == null ){
      return 0;
    } else {
      return shahoOpt[1] ? shahoOpt[0].shahokokuhoId : 0;
    }
  }

  function selectedRoujinId(): number {
    if( roujinOpt == null ){
      return 0;
    } else {
      return roujinOpt[1] ? roujinOpt[0].roujinId : 0;
    }
  }

  function selectedKoukikoureiId(): number {
    if( koukiOpt == null ){
      return 0;
    } else {
      return koukiOpt[1] ? koukiOpt[0].koukikoureiId : 0;
    }
  }

  function selectedKouhiList(): number[] {
    const selected = kouhiList.map(a => a[1] ? a[0].kouhiId : 0);
    selected.push(...[0,0,0]);
    return selected;
  }

  async function doEnter(close: () => void) {
    const selectedKouhi = selectedKouhiList();
    const idSet = {
      shahokokuhoId: selectedShahokokuhoId(),
      koukikoureiId: selectedKoukikoureiId(),
      roujinId: selectedRoujinId(),
      kouhi1Id: selectedKouhi[0],
      kouhi2Id: selectedKouhi[1],
      kouhi3Id: selectedKouhi[2],
    }
    await api.updateHokenIds(visit.visitId, idSet);
    close();
  }
</script>

<div class="disp" on:click={onDispClick}>{hokenRep(visit)}</div>

<Dialog bind:this={dialog} let:close={close}>
  <span slot="title">保険選択</span>
  <div>
    {#if shahoOpt != null }
    <div>
      <input type="checkbox" bind:checked={shahoOpt[1]}/>
      {shahokokuhoRep(shahoOpt[0])}
    </div>
    {/if}
    {#if roujinOpt != null }
    <div>
      <input type="checkbox" bind:checked={roujinOpt[1]}/>
      {roujinRep(roujinOpt[0].futanWari)}
    </div>
    {/if}
    {#if koukiOpt != null }
    <div>
      <input type="checkbox" bind:checked={koukiOpt[1]}/>
      {koukikoureiRep(koukiOpt[0].futanWari)}
    </div>
    {/if}
    {#each kouhiList as kouhi}
    <div><input type="checkbox" bind:checked={kouhi[1]}/>{kouhiRep(kouhi[0].futansha)}</div>
    {/each}
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>

<style>
  .disp {
    cursor: pointer;
  }
</style>

