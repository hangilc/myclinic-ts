<script lang="ts">
  import type { AppointTimeData } from "./appoint-time-data";
  import AppointPatient from "./AppointPatient.svelte";
  import RegisterAppointDialog from "./RegisterAppointDialog.svelte";

  export let data: AppointTimeData;

  let timeText = `${fromTimeText(data)} - ${untilTimeText(data)}`;

  function fromTimeText(data: AppointTimeData): string {
    return data.appointTime.fromTime.substring(0, 5);
  }

  function untilTimeText(data: AppointTimeData): string {
    return data.appointTime.untilTime.substring(0, 5);
  }

  function vacant(data: AppointTimeData): string {
    return data.appoints.length === 0 ? "vacant" : "";
  }

  async function doTimeBoxClick() {
    const d: RegisterAppointDialog = new RegisterAppointDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診察予約入力",
        appointTimeData: data
      }
    })
  }
</script>

<div class={`top ${data.appointTime.kind} ${vacant(data)}`}>
  <div class="time-box" on:click={doTimeBoxClick}>{timeText}</div>
  {#if data.appoints.length > 0}
    {#each data.appoints as appoint (appoint.appointId)}
      <AppointPatient data={appoint} />
    {/each}
  {/if}
</div>

<style>
  .top {
    margin-bottom: 6px;
    padding: 4px;
    border-radius: 6px;
  }

  .top.vacant {
    font-weight: bold;
  }

  .top.regular {
    background-color: #e8e8e8;
  }

  .top.regular.vacant {
    background-color: #9e9;
  }

  .top.flu-vac {
    background-color: #ffefd5;
  }
  .top.flu-vac.vacant {
    background-color: #ffdab9;
  }

  .top.covid-vac-pfizer {
    border: 2px solid blue;
  }

  .top.covid-vac-pfizer.vacant {
    border: 2px solid blue;
    background-color: #e7feff;
  }

  .top.covid-vac-pfizer-om {
    border: 2px solid green;
  }

  .top.covid-vac-pfizer-om.vacant {
    border: 2px solid green;
    background-color: #efe;
  }

  .top.covid-vac-moderna {
    border: 2px solid orange;
  }

  .top.covid-vac-moderna.vacant {
    border: 2px solid orange;
    background-color: #ffefd5;
  }

  .time-box {
    user-select: none;
  }
</style>
