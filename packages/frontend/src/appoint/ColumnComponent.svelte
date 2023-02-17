<script lang="ts">
  import Popup from "@/lib/Popup.svelte";
  import { ClinicOperation, ClinicOperationCode } from "myclinic-model/model";
  import * as kanjidate from "kanjidate";
  import type { AppointKind } from "./appoint-kind";
  import FilledCircle from "@/icons/FilledCircle.svelte";
  import ColumnContextMenu from "./ColumnContextMenu.svelte";
  import type { AppointTimeData } from "./appoint-time-data";
  import AppointTimeBlock from "./AppointTimeBlock.svelte";

  export let date: string;
  export let onFillAppointTimes: (close: () => void) => void;
  export let appointTimes: AppointTimeData[];
  export let isAdmin: boolean = false;
  export let clinicOp: ClinicOperation = new ClinicOperation(
    ClinicOperationCode.InOperation,
    ""
  );
  export let kenshinCount: number = 0;
  export let avails: AppointKind[] = [];
  const dateFormat = "{M}月{D}日（{W}）";

  function doContextMenu(
    event: MouseEvent,
    trigger: (e: MouseEvent) => void
  ): void {
    if (isAdmin) {
      event.preventDefault();
      trigger(event);
    }
  }

  function kenshinRep(kenshinCount: number): string {
    const n = kenshinCount;
    if (n > 0) {
      return `健${n}`;
    } else {
      return "";
    }
  }
</script>

<div
  class={`top ${isAdmin ? "admin" : ""}`}
  data-cy="appoint-column"
  data-date={date}
>
  <Popup let:destroy let:triggerClick>
    <div
      class={`date ${clinicOp.code}`}
      on:contextmenu={(e) => doContextMenu(e, triggerClick)}
      data-cy="date-block"
    >
      <span data-cy="date-disp">{kanjidate.format(dateFormat, date)}</span>
      <span class="kenshin-rep" data-cy="kenshin-rep"
        >{kenshinRep(kenshinCount)}</span
      >
      {#each avails as avail}
        <span data-cy="appoint-avail" data-kind={avail.code}
          ><FilledCircle
            width="20px"
            style={`fill:${avail.iconColor}; stroke:none; margin-bottom: -4px;`}
          /></span
        >
      {/each}
      <div class="date-label">{clinicOp.name ?? ""}</div>
    </div>
    <ColumnContextMenu
      slot="menu"
      {destroy}
      {onFillAppointTimes}
    />
  </Popup>
  {#each appointTimes as at (at.appointTime.fromTime)}
    <AppointTimeBlock data={at} column={data} />
  {/each}
</div>

<style>
</style>
