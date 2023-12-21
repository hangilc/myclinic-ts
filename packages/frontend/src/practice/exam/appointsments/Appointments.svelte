<script lang="ts">
  import api from "@/lib/api";
  import type { Appoint, AppointTime } from "myclinic-model";
  import { currentPatient, showAppoints, startPatient } from "../exam-vars";
  import RightBox from "../RightBox.svelte";

  let today = new Date();
  let data: [AppointTime, Appoint[]][] = [];

  showAppoints.subscribe((show) => {
    if (show) {
      refresh();
    }
  });

  async function refresh() {
    data = await api.listAppoints(today);
  }

  function doClose(): void {
    showAppoints.set(false);
  }

  async function doSelect(appoint: Appoint) {
    if( appoint.patientId > 0 ){
      const patient = await api.getPatient(appoint.patientId);
      startPatient(patient);
    }
  }
</script>

<RightBox title="予約患者">
  <div class="list">
    {#each data as [appointTime, appoints], i}
      {#each appoints as appoint (appoint.appointId)}
        <a href={appoint.patientId > 0 ? "javascript:void(0)" : undefined}
          on:click={() => doSelect(appoint)}
          class:current={$currentPatient && $currentPatient.patientId === appoint.patientId}
          >{appoint.patientName}</a
        >
      {/each}
      {#if appointTime.untilTime <= "12:00:00" && data[i + 1] && data[i + 1][0].fromTime > "12:00:00"}
        <hr />
      {/if}
    {/each}
  </div>
  <div class="commands">
    <a href="javascript:void(0)" on:click={refresh}>更新</a>
    <button on:click={doClose}>閉じる</button>
  </div>
</RightBox>

<style>
  .commands {
    display: flex;
    justify-content: right;
    align-items: center;;
  }

  .commands button {
    margin-left: 6px;
  }

  .list {
    margin-top: 10px;
  }

  .list a {
    display: block;
    margin-bottom: 2px;
  }

  .list a:not([href]) {
    color: black;
  }

  .list a.current {
    font-weight: bold;
  }
</style>
