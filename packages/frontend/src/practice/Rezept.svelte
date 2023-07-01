<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo, Visit } from "myclinic-model";
  import { listKouhi } from "./list-kouhi";
  import type { RezeptUnit } from "myclinic-rezept";
  import { createRezept, type CreateRezeptArg } from "myclinic-rezept";
  import type { Hokensha, RezeptDisease, RezeptKouhi, RezeptVisit } from "myclinic-rezept/rezept-types";
  import type { ShotokuKubunCode } from "myclinic-rezept/codes";
  import { cvtVistsToUnit, loadVisits } from "@/lib/rezept-adapter";

  export let isVisible: boolean;
  let year: number;
  let month: number;
  let clinicInfo: ClinicInfo | undefined = undefined;
  let preShow: string | undefined = undefined;
  let shiharaiSelect: "shaho"| "kokuho" = "shaho";

  initDate();
  initClinicInfo();

  function initDate(): void {
    let today = new Date();
    const d = today.getDate();
    if( d < 12 ){
      today.setMonth(today.getMonth() - 1);
    }
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    year = y;
    month = m;
  }

  async function initClinicInfo() {
    clinicInfo = await api.getClinicInfo();
  }

  async function createContent(): Promise<string> {
    if( !clinicInfo ){
      console.error("Cannot get ClinicInfo");
      return "";
    }
    const visitsMap = await loadVisits(year, month);
    // // DEBUG
    // visitsMap.kokuho = visitsMap.kokuho.filter(visits => {
    //   if( visits[0].patientId === 7438 ){
    //     return true;
    //   } else {
    //     return false;
    //   }
    // })
    // // end of DEBUG
    const visitsList = visitsMap[shiharaiSelect];
    const units: RezeptUnit[] = await Promise.all(visitsList.map(visits => cvtVistsToUnit(visits)));
    const arg: CreateRezeptArg = {
      seikyuuSaki: shiharaiSelect,
      year,
      month,
      clinicInfo,
      units,
    }
    console.log("arg", arg);
    return createRezept(arg);
  }

  async function doStart() {
    preShow = await createContent();
  }

  async function doDownload() {
    const content: string = await createContent();
    const bytes: Uint8Array = new TextEncoder().encode(content);
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "RECEIPTC.UKE";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function doListKouhi() {
    const result = await listKouhi(year, month);
    const s = result.map(r => {
      return `${r.patient.fullName()} (${r.patient.patientId}): ${r.kouhiList.join("、")}\n`
    }).join("");
    alert(s);
  }

</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="レセプト">
    <div class="start-block">
      <input type="text" bind:value={year} />年
      <input type="text" bind:value={month }/>月
      <input type="radio" bind:group={shiharaiSelect} value="shaho" />社保
      <input type="radio" bind:group={shiharaiSelect} value="kokuho" />国保
      <button on:click={doStart}>開始</button>
      <button on:click={doDownload}>ダウンロード</button>
      <a href="javascript:void(0)" on:click={doListKouhi}>公費リスト</a>
    </div>
  </ServiceHeader>
  {#if preShow !== undefined}
  <pre class="show">{preShow}</pre>
  {/if}
</div>

<style>
  .start-block {
    margin-left: 20px;
  }

  .start-block input {
    width: 4em;
  }

  input[type=radio] {
    width: auto;
  }

</style>