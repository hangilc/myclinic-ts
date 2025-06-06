<script lang="ts">
  import { isAdmin } from "./appoint-vars";
  import Bars3 from "@/icons/Bars3.svelte";
  import SearchAppointDialog from "./SearchAppointDialog.svelte";
  import api from "@/lib/api";
  import EventHistoryDialog from "./EventHistoryDialog.svelte";
  import { Appoint, type AppEvent, type AppointTime } from "myclinic-model";
  import { type PopupMenuItem, popupTrigger } from "@/lib/popup-helper";

  export let onCreateAppoints: () => void;
  export let onMoveWeeks: (n: number) => void;
  export let onThisWeek: () => void;

  function doAlloc() {
    onCreateAppoints();
  }

  async function populateMap(
    event: AppEvent,
    map: Record<number, AppointTime>,
  ) {
    if (event.model === "appoint") {
      const at = Appoint.cast(JSON.parse(event.data));
      const appointTimeId = at.appointTimeId;
      if (!(appointTimeId in map)) {
        const at = await api.getAppointTime(appointTimeId);
        map[appointTimeId] = at;
      }
    }
  }

  async function doEventLog() {
    const limit = 30;
    const offset = 0;
    const events = await api.listAppointEvents(limit, offset);
    const appointTimeMap: Record<number, AppointTime> = {};
    const proms = events.map((e) => populateMap(e, appointTimeMap));
    await Promise.all(proms);
    console.log(appointTimeMap);
    const d: EventHistoryDialog = new EventHistoryDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        events,
        appointTimeMap,
      },
    });
  }

  function doSearch(): void {
    const d: SearchAppointDialog = new SearchAppointDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      },
    });
  }

  function auxMenu(): PopupMenuItem[] {
    const m: PopupMenuItem[] = [];
    if (isAdmin) {
      m.push([
        "予約枠わりあて",
        doAlloc,
        {
          modifier: (a) => a.setAttribute("data-cy", "alloc-appoints-link"),
        },
      ]);
    }
    m.push(["変更履歴", doEventLog]);
    return m;
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top">
  <button on:click={() => onMoveWeeks(-4)}>前の月</button>
  <button on:click={() => onMoveWeeks(-1)}>前の週</button>
  <a href="javascript:void(0)" on:click={onThisWeek}>今週</a>
  <button on:click={() => onMoveWeeks(1)}>次の週</button>
  <button on:click={() => onMoveWeeks(4)}>次の月</button>
  <div class="menu">
    <a href="javascript:void(0)" on:click={doSearch}>予約検索</a>
    <Bars3
      onClick={popupTrigger(auxMenu)}
      style="cursor: pointer;"
      dy="-2px"
      width="18"
      dataCy="bars3-menu"
    />
    <!-- <div slot="menu" class="context-menu">
        {#if isAdmin}
          <a href="javascript:void(0)" on:click={() => doAlloc(destroy)}
            data-cy="alloc-appoints-link"
            >予約枠わりあて</a
          >
        {/if}
        <a href="javascript:void(0)" on:click={() => doEventLog(destroy)}
          >変更履歴</a
        >
      </div> -->
  </div>
</div>

<style>
  .top {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .menu {
    display: inline-flex;
    align-items: center;
    float: right;
    line-height: 1;
  }

  /* .menu-icon {
    color: gray;
    cursor: pointer;
    position: relative;
    top: -2px;
  } */

  button {
    margin-left: 0;
  }

  a {
    margin: 0 6px;
  }
</style>
