<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { fromZenkakuWith, spaceMap } from "@/lib/zenkaku";
  import type { Appoint, AppointTime } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import { resolveAppointKind } from "./appoint-kind";

  export let destroy: () => void;
  let result: [Appoint, AppointTime][] = [];
  let searchValue: string = "";
  let curYear = (new Date()).getFullYear();

  async function doSearch() {
    const t = searchValue.trim();
    if( t !== "" ){
      if( /^\d+$/.test(t) ){
        const patientId = parseInt(t);
        result = await api.searchAppointByPatientId(patientId);
      } else {
        const m = /[ 　]/.exec(t);
        console.log(m);
        if( m ){
          const i = m.index
          const t1 = t.substring(0, i);
          let t2 = t.substring(i+1).trim();
          t2 = fromZenkakuWith(spaceMap, t2).trim();
          console.log("t1 - t2", t1, "-", t2);
          result = await api.searchAppointByPatientName2(t1, t2);
        } else {
          result = await api.searchAppointByPatientName(t);
        }
      }
    }
  }

  function formatDate(date: string): string {
    const y = new Date(date).getFullYear();
    if( y === curYear ){
      return kanjidate.format("{M}月{D}日（{W}）", date);
    } else {
      return kanjidate.format("{G}{N}年{M}月{D}日（{W}）", date);
    }
  }

  function memoPart(a: Appoint, at: AppointTime): string {
    const parts: string[] = [];
    if( a.memoString ){
      parts.push(a.memoString);
    }
    parts.push(...a.tags);
    const kind = resolveAppointKind(at.kind);
    if( kind ){
      parts.push(kind.label);
    }
    return parts.join("、");
  }

</script>

<Dialog {destroy} title="予約検索">
  <form class="form" on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchValue} use:setFocus/>
    <button type="submit">検索</button>
  </form>
  <div class="result">
    {#each result as r (r[0].appointId)}
      {@const appoint=r[0]}
      {@const appointTime=r[1]}
      {@const memo=memoPart(appoint, appointTime)}
      <div class="item">
        {appoint.patientName}
        {#if appoint.patientId > 0}
        ({appoint.patientId})
        {/if}
        {#if memo}（{memo}）{/if}
        {formatDate(appointTime.date)}
        {appointTime.fromTime} - {appointTime.untilTime}
      </div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .result {
    width: 300px;
    height: 300px;
    resize: vertical;
    border: 1px solid gray;
    padding: 10px;
    margin-top: 10px;
    overflow-y: auto;
  }

  .item {
    margin: 10px 4px;
  }

  .item:first-of-type {
    margin-top: 0;
  }

  .item:last-of-type {
    margin-bottom: 0;
  }


  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }
</style>
