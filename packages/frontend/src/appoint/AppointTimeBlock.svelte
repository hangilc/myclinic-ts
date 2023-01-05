<script lang="ts">
  import type { AppointTimeData } from "./appoint-time-data";
  import AppointPatient from "./AppointPatient.svelte";
  import AppointDialog from "./AppointDialog.svelte";
  import { isAdmin } from "./appoint-vars";
  import AppointTimeDialog from "./AppointTimeDialog.svelte";
  import Popup from "@/lib/Popup.svelte";
  import { resolveAppointKind } from "./appoint-kind";
  import type { ColumnData } from "./column-data";
  import type { AppointTime } from "myclinic-model";
  import BindAppointTimesDialog from "./BindAppointTimesDialog.svelte";
  import api from "@/lib/api";
  import SplitAppointTimeDialog from "./SplitAppointTimeDialog.svelte";

  export let data: AppointTimeData;
  export let column: ColumnData;
  
  function timeText(data: AppointTimeData): string {
    return `${fromTimeText(data)} - ${untilTimeText(data)}`;
  }

  function fromTimeText(data: AppointTimeData): string {
    return data.appointTime.fromTime.substring(0, 5);
  }

  function untilTimeText(data: AppointTimeData): string {
    return data.appointTime.untilTime.substring(0, 5);
  }

  function vacant(data: AppointTimeData): string {
    return data.appoints.length === 0 ? "vacant" : "";
  }

  function doTimeBoxClick() {
    if (data.hasVacancy) {
      const d: AppointDialog = new AppointDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          title: "診察予約入力",
          data: data,
        },
      });
    }
  }

  function doOpenEditDialog(destroy: () => void): void {
    destroy();
    if (isAdmin) {
      const d: AppointTimeDialog = new AppointTimeDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          title: "予約枠編集",
          data: data.appointTime,
          siblings: column.appointTimes,
        },
      });
    }
  }

  function doOpenBindDialog(destroy: () => void): void {
    destroy();
    const n = column.planBind(data.appointTime);
    if( n != undefined ){
      const b = Object.assign({}, data.appointTime, {
        untilTime: n.untilTime
      }) as AppointTime;
      const d: BindAppointTimesDialog = new BindAppointTimesDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          appointTime: b,
          onOk: async () => {
            await api.deleteAppointTime(n.appointTimeId);
            await api.updateAppointTime(b);
            d.$destroy();
          }
        }
      })
    }
  }

  function doOpenSplitDialog(destroy: () => void): void {
    destroy();
    const d: SplitAppointTimeDialog = new SplitAppointTimeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        appointTime: data.appointTime
      }
    })
  }

  function doContextMenu(
    event: MouseEvent,
    trigger: (e: MouseEvent) => void
  ): void {
    if (isAdmin) {
      event.preventDefault();
      console.log(event.clientY);
      trigger(event);
    }
  }

  function capacityRep(data: AppointTimeData): string {
    if( data.appointTime.kind === "regular" && data.appointTime.capacity === 1 ){
      return "";
    } else {
      const c = data.appointTime.capacity;
      return `(${c})`;
    }
  }

  function appointKindRep(data: AppointTimeData): string {
    const rep = resolveAppointKind(data.appointTime.kind)?.label
    return rep ? `[${rep}]` : "";
  }
</script>

<div class={`top ${data.appointTime.kind} ${vacant(data)}`}>
  <Popup let:triggerClick let:destroy>
    <div
      class="time-box"
      on:click={doTimeBoxClick}
      on:contextmenu={(evt) => doContextMenu(evt, triggerClick)}
    >
      <div>{timeText(data)} {capacityRep(data)}</div>
      <div>{appointKindRep(data)}</div>
    </div>
    <div slot="menu" class="context-menu">
      {#if isAdmin}
        <a href="javascript:void(0)" on:click={() => doOpenEditDialog(destroy)}>編集</a>
        <a href="javascript:void(0)" on:click={() => doOpenBindDialog(destroy)}>結合</a>
        <a href="javascript:void(0)" on:click={() => doOpenSplitDialog(destroy)}>分割</a>
        <a href="javascript:void(0)">削除</a>
      {/if}
    </div>
  </Popup>
  {#if data.appoints.length > 0}
    {#each data.appoints as appoint (appoint.appointId)}
      <AppointPatient data={appoint} appointTimeData={data} />
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

  .context-menu a {
    display: block;
    margin-bottom: 4px;
  }

  .context-menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
