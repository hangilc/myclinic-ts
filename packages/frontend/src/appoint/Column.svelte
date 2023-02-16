<script lang="ts">
  import type { ColumnData } from "./column-data";
  import * as kanjidate from "kanjidate";
  import AppointTimeBlock from "./AppointTimeBlock.svelte";
  import FilledCircle from "@/icons/FilledCircle.svelte";
  import Popup from "@/lib/Popup.svelte";
  import { isAdmin } from "./appoint-vars";
  import ColumnContextMenu from "./ColumnContextMenu.svelte";

  export let data: ColumnData;
  const dateFormat = "{M}月{D}日（{W}）";

  function kenshinRep(data: ColumnData): string {
    const n = data.countKenshin();
    if (n > 0) {
      return `健${n}`;
    } else {
      return "";
    }
  }

  function doContextMenu(
    event: MouseEvent,
    trigger: (e: MouseEvent) => void
  ): void {
    if (isAdmin) {
      event.preventDefault();
      trigger(event);
    }
  }
</script>

<div class={`top ${isAdmin ? "admin" : ""}`}>
  <Popup let:destroy let:triggerClick>
    <div
      class={`date ${data.op.code}`}
      on:contextmenu={(e) => doContextMenu(e, triggerClick)}
      data-cy="appoint-column"
      data-date={data.date}
    >
      {kanjidate.format(dateFormat, data.date)}
      <span class="kenshin-rep">{kenshinRep(data)}</span>
      {#each data.collectAvail() as avail}
        <span
          ><FilledCircle
            width="20px"
            style={`fill:${avail.iconColor}; stroke:none; margin-bottom: -4px;`}
          /></span
        >
      {/each}
      <div class="date-label">{data.op.name ?? ""}</div>
    </div>
    <ColumnContextMenu
      slot="menu"
      {destroy}
      date={data.date}
      siblings={data.appointTimes}
    />
  </Popup>
  {#each data.appointTimes as at (at.appointTime.fromTime)}
    <AppointTimeBlock data={at} column={data} />
  {/each}
</div>

<style>
  .top {
    width: 160px;
  }

  .date {
    background-color: white;
    font-weight: bold;
    border-radius: 6px;
    border: 1px solid gray;
    padding: 4px;
    margin-bottom: 10px;
  }

  .date.national-holiday,
  .date.ad-hoc-holiday {
    border-color: red;
  }

  .date.national-holiday .date-label,
  .date.ad-hoc-holiday .date-label {
    color: red;
  }

  .kenshin-rep {
    font-weight: normal;
  }
</style>
