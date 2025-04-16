<script lang="ts">
  import api from "@/lib/api";
  import type { Appoint, AppointTime } from "myclinic-model";
  import { currentPatient, showAppoints, startPatient } from "../exam-vars";
  import RightBox from "../RightBox.svelte";
  import { pad } from "@/lib/pad";
  import { DateWrapper } from "myclinic-util";

  let today = new Date();
  let curdate = today;
  let data: [AppointTime, Appoint[]][] = [];
  let showList = true;
    
  showAppoints.subscribe((show) => {
    if (show) {
      refresh();
    }
  });

  async function refresh() {
    data = await api.listAppoints(curdate);
  }

  function doClose(): void {
    showAppoints.set(false);
  }

  async function doSelect(appoint: Appoint) {
    if (appoint.patientId > 0) {
      const patient = await api.getPatient(appoint.patientId);
      startPatient(patient);
    }
  }

  function doCollapse() {
    showList = false;
  }

  function doExtend() {
    showList = true;
  }

  function doChangeDate() {
    let input = prompt("日付（YYYY-MM-DD）：", DateWrapper.from(curdate).asSqlDate());
    if (input) {
      curdate = DateWrapper.from(input).asDate();
      refresh();
    }
  }

  function dateRep(date: Date): string {
    let d = DateWrapper.from(curdate);
    return d.render(
      (d) => `${d.getGengou()}${d.getNen()}年${d.getMonth()}月${d.getDay()}日（${d.youbi}）`,
    );
  }
</script>

<RightBox title="予約患者">
  {#if curdate != today}
    <div>{dateRep(curdate)}</div>
  {/if}
  {#if showList}
    <div class="list">
      {#each data as [appointTime, appoints], i}
        {#each appoints as appoint (appoint.appointId)}
          <a
            href={appoint.patientId > 0 ? "javascript:void(0)" : undefined}
            on:click={() => doSelect(appoint)}
            class:current={$currentPatient &&
              $currentPatient.patientId === appoint.patientId}
            >{pad(appoint.patientId, 4, "0")} {appoint.patientName}</a
          >
        {/each}
        {#if appointTime.untilTime <= "12:00:00" && data[i + 1] && data[i + 1][0].fromTime > "12:00:00"}
          <hr />
        {/if}
      {/each}
    </div>
  {/if}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="commands">
    <a href="javascript:void(0)" on:click={doChangeDate}>日付変更</a>
    <a href="javascript:void(0)" on:click={refresh}>更新</a>
    <a href="javascript:void(0)" on:click={doClose}>閉じる</a>
    {#if showList}
      <a href="javascript:void(0)" on:click={doCollapse}>圧縮</a>
    {:else}
      <a href="javascript:void(0)" on:click={doExtend}>伸展</a>
    {/if}
  </div>
</RightBox>

<style>
  .commands {
    margin-top: 8px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }

  a {
    cursor: pointer;
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
