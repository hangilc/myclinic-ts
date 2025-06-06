<script lang="ts">
  import {
    type VisitEx,
    dateToSqlDate,
  } from "myclinic-model";
  import { hokenRep } from "@/lib/hoken-rep";
  import api from "@/lib/api";
  import HokenChoiceDialog from "./HokenChoiceDialog.svelte";
  import { onshiDeleted, onshiEntered } from "@/app-events";
  import { OnshiResult } from "onshi-result";

  export let visit: VisitEx;
  export let onshiConfirmed: boolean | undefined = undefined;

  const unsubs: (() => void)[] = [];

  unsubs.push(
    onshiEntered.subscribe((o) => {
      if (!o) {
        return;
      }
      if( o.visitId === visit.visitId ){
        onshiConfirmed = true;
      }
    })
  );

  unsubs.push(onshiDeleted.subscribe((o) => {
    if( !o ){
      return;
    }
    if( o.visitId === visit.visitId ){
      onshiConfirmed = false;
    }
  }));

  async function onDispClick() {
    const patientId = visit.patient.patientId;
    const at = new Date(visit.visitedAt);
    const shahokokuhoList = await api.listAvailableShahokokuho(patientId, at);
    const koukikoureiList = await api.listAvailableKoukikourei(patientId, at);
    const kouhiList = await api.listAvailableKouhi(patientId, at);
    const onshi = await api.findOnshi(visit.visitId);
    const d: HokenChoiceDialog = new HokenChoiceDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        visit: visit.asVisit,
        shahokokuhoList,
        koukikoureiList,
        kouhiList,
        onshiResult: onshi ? OnshiResult.cast(JSON.parse(onshi.kakunin)) : undefined,
        visitDate: dateToSqlDate(visit.visitedAtAsDate),
      },
    });
  }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="disp" on:click={onDispClick} data-type="hoken" 
  data-onshi-confirmed={onshiConfirmed ?? "false"}>
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
  <span style="user-select:none;">{hokenRep(visit)}</span>
</div>

<style>
  .disp {
    cursor: pointer;
  }
</style>
