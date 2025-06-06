<script lang="ts">
  import { calcAge } from "@/lib/calc-age";
  import type { Patient, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import CashierDialog from "./CashierDialog.svelte";
  import type { WqueueData } from "./wq-data";
  import { openRecords } from "./open-records";
  import * as auxMenu from "./wq-table-aux-menu";
  import { popupTrigger } from "@/lib/popup-helper";
  import { hotlineTrigger } from "@/lib/event-emitter";
  import { MeisaiWrapper, calcRezeptMeisai } from "@/lib/rezept-meisai";
  import type { Writable } from "svelte/store";
  import { FormatDate } from "myclinic-util";

  // export let items: WqueueData[];
  export let items: Writable<WqueueData[]>;
  export let isAdmin: boolean;

  function formatDob(birthday: string): string {
    return FormatDate.f2(birthday);
  }

  async function doCashier(visit: Visit) {
    // let meisai = await api.getMeisai(visit.visitId);
    let meisai = await calcRezeptMeisai(visit.visitId);
    let patient = await api.getPatient(visit.patientId);
    let charge = await api.getCharge(visit.visitId);
    let visitEx = await api.getVisitEx(visit.visitId);
    const d: CashierDialog = new CashierDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient,
        visit: visitEx,
        meisai: new MeisaiWrapper(meisai),
        charge,
      },
    });
  }

  function doRecord(patient: Patient): void {
    openRecords(patient);
  }
</script>

<div class="top">
  <div class="col-state" />
  <div class="col-patient-id" />
  <div class="col-name" />
  <div class="col-yomi" />
  <div class="col-sex" />
  <div class="col-age" />
  <div class="col-birthday" />
  <div class="col-manip" />
  <div class="header-row">
    <div>状態</div>
    <div>患者番号</div>
    <div>氏名</div>
    <div>よみ</div>
    <div>性別</div>
    <div>年齢</div>
    <div>生年月日</div>
    <div>操作</div>
  </div>
  {#each $items as item (item.visitId)}
    {@const wq = item.wq}
    {@const visit = item.visit}
    {@const patient = item.patient}
    <div
      class="wq-row"
      data-cy="wq-row"
      data-patient-id={patient.patientId}
      data-visit-id={visit.visitId}
      class:waitcashier={wq.waitState === 2}
    >
      <div class="wq-state">{wq.waitStateType.label}</div>
      <div>{patient.patientId}</div>
      <div class="patient-name">{patient.fullName(" ")}</div>
      <div>{patient.fullYomi(" ")}</div>
      <div>{patient.sexType.rep}</div>
      <div>{calcAge(patient.birthday)}才</div>
      <div class="dob">{formatDob(patient.birthday)}</div>
      <div class="manip">
        <div class="manip-content">
          {#if item.isWaitCashier}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="do-cashier" on:click={() => doCashier(visit)}>会計</div>
          {/if}
          <a href="javascript:void(0)" on:click={() => doRecord(patient)}
            >診療録</a
          >
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <svg
            width="1.2rem"
            class="menu-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            on:click={popupTrigger(() => [
              ["患者", () => auxMenu.doPatient(patient, hotlineTrigger, isAdmin)],
              ["削除", () => auxMenu.doDeleteVisit(visit)],
            ], {
              modifier: m => m.setAttribute("data-cy", "wq-row-aux-menu")
            })}
            data-cy="aux-menu-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
          <!-- <WqTableAuxMenu slot="menu" {destroy} {visit} {patient}/> -->
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .top {
    display: table;
    margin: 20px 0;
    border: 1px solid gray;
    padding: 10px;
    border-radius: 6px;
  }

  .col-state {
    display: table-column;
    width: 3rem;
  }

  .col-patient-id {
    display: table-column;
    width: 4rem;
  }

  .col-name {
    display: table-column;
    width: 6rem;
  }

  .col-yomi {
    display: table-column;
    width: 10rem;
  }

  .col-sex {
    display: table-column;
    width: 2rem;
  }

  .col-age {
    display: table-column;
    width: 3rem;
  }

  .col-birthday {
    display: table-column;
    width: 7.5rem;
  }

  .col-manip {
    display: table-column;
    width: 8rem;
  }

  .header-row {
    display: table-row;
  }

  .header-row > div {
    display: table-cell;
    font-weight: bold;
    font-size: 0.8rem;
    padding-bottom: 6px;
    line-height: 1;
  }

  .wq-row {
    display: table-row;
  }

  .wq-row .wq-state {
    padding-left: 6px;
  }

  .wq-row:nth-of-type(2n) {
    background-color: #17a2b811;
  }

  .wq-row.waitcashier {
    /* animation: 1s forwards pump infinite */
    background-color: #fdd;
  }

  .wq-row.waitcashier .wq-state {
    font-weight: bold;
    color: red;
  }

  .wq-row.waitcashier .patient-name {
    font-weight: bold;
  }

  @keyframes pump {
    0% {
      border-color: rgba(255, 0, 0, 0);
    }

    100% {
      border-color: rgba(255, 0, 0, 1.0);
    }
  }

  .wq-row.waitcashier .do-cashier {
    /* animation: 1s pump infinite; */
    animation: 1s linear pump infinite;
    border: 2px solid;
    color: red;
    padding: 5px 8px;
    font-weight: bold;
    background-color: white;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1em;
  }

  .wq-row > div {
    display: table-cell;
    padding: 2px;
    line-height: 1;
  }

  .wq-row .dob {
    font-size: 0.8rem;
  }

  .manip-content {
    display: flex;
    align-items: center;
  }

  .manip-content > a {
    margin-left: 3px;
    line-height: 1;
    user-select: none;
  }

  .menu-icon {
    color: gray;
    cursor: pointer;
    /* position: relative;
    top: 3px; */
  }
</style>
