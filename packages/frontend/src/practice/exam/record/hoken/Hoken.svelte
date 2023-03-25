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
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import type { OnshiResult } from "onshi-result";
  import { onshi_query_from_hoken } from "@/lib/onshi-query-helper";

  export let visit: VisitEx;
  export let onshiConfirmed: boolean | undefined = undefined;
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

  async function onshiConfirm(hoken: Shahokokuho | Koukikourei) {
    const query = await onshi_query_from_hoken(
      hoken,
      visit.patient.birthday.replaceAll("-", ""),
      visit.visitedAt.substring(0, 10).replaceAll("-", "")
    );
    const d: OnshiKakuninDialog = new OnshiKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        query,
        onDone: (result: OnshiResult | undefined) =>
          onOnshiConfirmDone(result, hoken),
      },
    });
  }

  function onOnshiConfirmDone(
    result: OnshiResult | undefined,
    hoken: Shahokokuho | Koukikourei
  ) {}
</script>

<div class="disp" on:click={onDispClick}>
  {#if (visit.hoken.shahokokuho || visit.hoken.koukikourei) && onshiConfirmed !== undefined}
    {#if onshiConfirmed}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="green"
        class="w-6 h-6"
        width="18"
        style="position:relative;top:3px;right:-3px"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="red"
        class="w-6 h-6"
        width="18"
        style="position:relative;top:3px;right:-3px"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    {/if}
  {/if}
  {hokenRep(visit)}
</div>

{#if showHokenChoice}
  <Dialog destroy={closeHokenDialog} title="保険選択">
    <div>
      {#if shahoOpt != null}
        {@const shaho = shahoOpt[0]}
        <div>
          <input type="checkbox" bind:checked={shahoOpt[1]} />
          {shahokokuhoRep(shaho)}
          <a href="javascript:void(0)" on:click={() => onshiConfirm(shaho)}
            >資格確認</a
          >
        </div>
      {/if}
      {#if roujinOpt != null}
        <div>
          <input type="checkbox" bind:checked={roujinOpt[1]} />
          {roujinRep(roujinOpt[0].futanWari)}
        </div>
      {/if}
      {#if koukiOpt != null}
        {@const koukikourei = koukiOpt[0]}
        <div>
          <input type="checkbox" bind:checked={koukiOpt[1]} />
          {koukikoureiRep(koukiOpt[0].futanWari)}
          <a
            href="javascript:void(0)"
            on:click={() => onshiConfirm(koukikourei)}>資格確認</a
          >
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
