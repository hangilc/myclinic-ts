<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import { pad } from "@/lib/pad";
  import { cvtVisitsToUnit, loadVisits } from "@/lib/rezept-adapter";
  import type { Visit, VisitEx } from "myclinic-model";
  import { checkForRcpt, type CheckError } from "./rcpt-check/check";

  export let isVisible = false;
  let shinryouYearMonth: string = defaultShinryouYearMonth();
  let patientTotal = 0;
  let current = 0;
  let serial = 1;
  let errors: [number, CheckError][] = [];

  function defaultShinryouYearMonth(): string {
    let now = new Date();
    const d = now.getDate();
    if (d <= 10) {
      now.setMonth(now.getMonth() - 1);
    }
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1, 2, "0");
    return `${y}${m}`;
  }

  function getYear(): number {
    return parseInt(shinryouYearMonth.substring(0, 4));
  }

  function getMonth(): number {
    return parseInt(shinryouYearMonth.substring(4, 6));
  }

  async function doStart() {
    const year = getYear();
    const month = getMonth();
    const visitMap = await loadVisits(year, month);
    const visitsList: Visit[][] = [...visitMap.shaho, ...visitMap.kokuho];
    current = 0;
    patientTotal = visitsList.length;
    errors = [];
    serial = 1;
    for(const visits of visitsList) {
      if( visits.length === 0 ){
        continue;
      }
      current += 1;
      let patientVisits: VisitEx[] = await Promise.all(visits.map(async visit => await api.getVisitEx(visit.visitId)));
      const errs = checkForRcpt(patientVisits);
      if( errs !== "ok" && errs !== "no-visit" ){
        const es: [number, CheckError][] = errs.map(e => [serial++, e]);
        errors = [...errors, ...es];
      }
    }
  }
</script>

<div style:display={isVisible ? "" : "none"} class="wrapper">
  <ServiceHeader title="レセプトチェック" />
  <div>
    診療年月：<input type="text" bind:value={shinryouYearMonth} />
  </div>
  <div>
    <button on:click={doStart}>スタート</button>
  </div>
  <div>
    {#if patientTotal > 0}
      {current} / {patientTotal}
    {/if}
  </div>
  <div>
    {#each errors as error (error[0])}
      {@const checkError = error[1]}
      {@const code = checkError[0]}
      {@const visit = checkError[1]}
      {@const patient = visit.patient}
      <div>
        {code}: ({patient.patientId}) {patient.fullName()}
        {#if code === "一般名処方加算１（１品目）"}
          <div>
            <button on:click={}>Fix</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .wrapper > div {
    margin-bottom: 10px;
  }
</style>
