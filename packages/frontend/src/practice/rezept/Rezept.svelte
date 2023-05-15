<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo } from "myclinic-model";

  export let isVisible: boolean;
  let year: number;
  let month: number;
  let clinicInfo: ClinicInfo | undefined = undefined;

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
    console.log(clinicInfo);
  }

  async function doStart() {
    
    const visits = await api.listVisitByMonth(year, month);
    console.log(visits);
  }

</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="レセプト">
    <div class="start-block">
      <input type="text" bind:value={year} />年
      <input type="text" bind:value={month }/>月
      <button on:click={doStart}>開始</button>
    </div>
  </ServiceHeader>
</div>

<style>
  .start-block {
    margin-left: 20px;
  }

  .start-block input {
    width: 4em;
  }
</style>