<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { pad } from "@/lib/pad";
  import { cvtVisitsToUnit, loadVisits } from "@/lib/rezept-adapter";
  import type { Visit } from "myclinic-model";

  export let isVisible = false;
  let shinryouYearMonth: string = defaultShinryouYearMonth();
  let patientTotal = 0;
  let current = 0;

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
    for(const visits of visitsList) {
      current += 1;
      const u = await cvtVisitsToUnit(visits);
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
</div>

<style>
  .wrapper > div {
    margin-bottom: 10px;
  }
</style>
