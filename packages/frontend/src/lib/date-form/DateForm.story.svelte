<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { errorMessagesOf, type VResult } from "../validation";
  import DateForm from "./DateForm.svelte";
  import { format, f5 } from "kanjidate";

  export let Hst: Hst;
  let date: Date | null = new Date();
  let logs: string[] = [];
  let setDate: (d: Date | null) => void = d => date = d;

  function log(arg: any): void {
    const t = JSON.stringify(arg, undefined, 2);
    logs = [t, ...logs];
  }

  function logResult(r: VResult<Date | null>): void {
    if( r.isValid ){
      if( r.value == null ){
        logEvent("data", { data: r.value });
      } else {
        logEvent("data", { data: format(f5, r.value) });
      }
    } else {
      logEvent("error", errorMessagesOf(r.errors));
    }
  }

  function doChange(evt: CustomEvent<VResult<Date | null>>): void {
    console.log("doChange");
    const r = evt.detail;
    logResult(r);
  }

  function doSet(): void {
    setDate(new Date(2022, 3, 12));
  }

  function doNull(): void {
    setDate(null);
  }

  function dateRep(d: Date | null | undefined): string {
    if( d === undefined ){
      return "（エラー）";
    } else if( d === null ){
      return "（未設定）"
    } else {
      return format(f5, d);
    }
  }
</script>

<Hst.Story>
  <DateForm bind:date on:value-change={doChange}/>
  <button on:click={doSet}>Set</button>
  <button on:click={doNull}>Null</button>
  <div class="date-box">
    { dateRep(date) }
    <button on:click={() => logs = []}>clear logs</button>
  </div>
  <div class="logs">
    {#each logs as log}
      <pre>{log}</pre>
    {/each}
  </div>
</Hst.Story>

<style>
  .date-box {
    margin: 10px 0;
  }

  .logs {
    margin-top: 10px;
    border: 1px solid gray;
    min-height: 10px;
  }
</style>
