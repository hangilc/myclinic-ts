<script lang="ts">
  import type {
    VisitEx,
    Shahokokuho,
    Koukikourei,
    Kouhi,
    Roujin,
    Patient,
  } from "myclinic-model";
  import {
    hokenRep,
    shahokokuhoRep,
    roujinRep,
    koukikoureiRep,
    kouhiRep,
  } from "@/lib/hoken-rep";
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import OnshiKakuninDialog from "@/cashier/patient-dialog2/OnshiKakuninDialog.svelte";
  import { pad } from "@/lib/pad";

  export let visit: VisitEx;
  let shahoOpt: [Shahokokuho, boolean] | null = null;
  let roujinOpt: [Roujin, boolean] | null = null;
  let koukiOpt: [Koukikourei, boolean] | null = null;
  let kouhiList: [Kouhi, boolean][] = [];
  let showHokenChoice = false;

  function closeHokenDialog(): void {
    showHokenChoice = false;
  }

  async function onDispClick() {
    const patientId = visit.patient.patientId;
    const at = new Date(visit.visitedAt);
    shahoOpt = await resolveShahokokuho(patientId, at);
    roujinOpt = await resolveRoujin(patientId, at);
    koukiOpt = await resolveKoukikourei(patientId, at);
    kouhiList = await resolveKouhiList(patientId, at);
    showHokenChoice = true;
  }

  async function resolveShahokokuho(
    patientId: number,
    at: Date
  ): Promise<[Shahokokuho, boolean] | null> {
    const shaho = await api.findAvailableShahokokuho(patientId, at);
    if (shaho == null) {
      return null;
    } else {
      console.log(visit.hoken);
      console.log([
        shaho,
        visit.hoken.shahokokuho?.shahokokuhoId === shaho.shahokokuhoId,
      ]);
      return [
        shaho,
        visit.hoken.shahokokuho?.shahokokuhoId === shaho.shahokokuhoId,
      ];
    }
  }

  async function resolveRoujin(
    patientId: number,
    at: Date
  ): Promise<[Roujin, boolean] | null> {
    const hoken = await api.findAvailableRoujin(patientId, at);
    if (hoken == null) {
      return null;
    } else {
      return [hoken, visit.hoken.roujin?.roujinId === hoken.roujinId];
    }
  }

  async function resolveKoukikourei(
    patientId: number,
    at: Date
  ): Promise<[Koukikourei, boolean] | null> {
    const hoken = await api.findAvailableKoukikourei(patientId, at);
    if (hoken == null) {
      return null;
    } else {
      return [
        hoken,
        visit.hoken.koukikourei?.koukikoureiId === hoken.koukikoureiId,
      ];
    }
  }

  async function resolveKouhiList(
    patientId: number,
    at: Date
  ): Promise<[Kouhi, boolean][]> {
    const kouhiList = await api.listAvailableKouhi(patientId, at);
    return kouhiList.map((k) => [
      k,
      visit.hoken.kouhiList.findIndex((kouhi) => kouhi.kouhiId === k.kouhiId) >=
        0,
    ]);
  }

  function selectedShahokokuhoId(): number {
    if (shahoOpt == null) {
      return 0;
    } else {
      return shahoOpt[1] ? shahoOpt[0].shahokokuhoId : 0;
    }
  }

  function selectedRoujinId(): number {
    if (roujinOpt == null) {
      return 0;
    } else {
      return roujinOpt[1] ? roujinOpt[0].roujinId : 0;
    }
  }

  function selectedKoukikoureiId(): number {
    if (koukiOpt == null) {
      return 0;
    } else {
      return koukiOpt[1] ? koukiOpt[0].koukikoureiId : 0;
    }
  }

  function selectedKouhiList(): number[] {
    const selected = kouhiList.map((a) => (a[1] ? a[0].kouhiId : 0));
    selected.push(...[0, 0, 0]);
    return selected;
  }

  async function doEnter() {
    const selectedKouhi = selectedKouhiList();
    const idSet = {
      shahokokuhoId: selectedShahokokuhoId(),
      koukikoureiId: selectedKoukikoureiId(),
      roujinId: selectedRoujinId(),
      kouhi1Id: selectedKouhi[0],
      kouhi2Id: selectedKouhi[1],
      kouhi3Id: selectedKouhi[2],
    };
    await api.updateHokenIds(visit.visitId, idSet);
    closeHokenDialog();
  }

  async function confirmShahokokuho(arg: [Shahokokuho, boolean] | null) {
    if( arg != null ){
      const h = arg[0];
      const server = await api.dictGet("onshi-server");
      const secret = await api.dictGet("onshi-secret");
      const patient: Patient = visit.patient;
      const d: OnshiKakuninDialog = new OnshiKakuninDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          hokensha: pad(h.hokenshaBangou, 8, "0"),
          hihokenshaBangou: h.hihokenshaBangou,
          hihokenshaKigou: h.hihokenshaKigou == "" ? undefined : h.hihokenshaKigou,
          birthdate: patient.birthday.replaceAll("-", ""),
          confirmDate: visit.visitedAt.substring(0, 10).replaceAll("-", ""),
          server,
          secret,
          onConfirm: (data) => {}
        }
      })
    }
  }
</script>

<div class="disp" on:click={onDispClick}>{hokenRep(visit)}</div>

{#if showHokenChoice}
  <Dialog destroy={closeHokenDialog} title="保険選択">
    <div>
      {#if shahoOpt != null}
        <div>
          <input type="checkbox" bind:checked={shahoOpt[1]} />
          {shahokokuhoRep(shahoOpt[0])}
          <a href="javascript:void(0)" on:click={() => confirmShahokokuho(shahoOpt)}>資格確認</a>
        </div>
      {/if}
      {#if roujinOpt != null}
        <div>
          <input type="checkbox" bind:checked={roujinOpt[1]} />
          {roujinRep(roujinOpt[0].futanWari)}
        </div>
      {/if}
      {#if koukiOpt != null}
        <div>
          <input type="checkbox" bind:checked={koukiOpt[1]} />
          {koukikoureiRep(koukiOpt[0].futanWari)}
        </div>
      {/if}
      {#each kouhiList as kouhi}
        <div>
          <input type="checkbox" bind:checked={kouhi[1]} />{kouhiRep(
            kouhi[0].futansha
          )}
        </div>
      {/each}
    </div>
    <div class="commands">
      <button on:click={doEnter}>入力</button>
      <button on:click={closeHokenDialog}>キャンセル</button>
    </div>
  </Dialog>
{/if}

<style>
  .disp {
    cursor: pointer;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 4px;
    line-height: 1;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
