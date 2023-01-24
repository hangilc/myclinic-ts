<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { errorMessagesOf, type VResult } from "../validation";
  import DateForm from "./DateForm.svelte";
  import * as kanjidate from "kanjidate";

  export let Hst: Hst;
  let date: Date | null | undefined = new Date();
  let validate: () => VResult<Date | null>;
  let logs: string[] = [];
  let setDate: (d: Date | null) => void;

  function log(arg: any): void {
    const t = JSON.stringify(arg, undefined, 2);
    logs = [t, ...logs];
  }

  function doChange(r: VResult<Date | null>): void {
    if( r.isValid ){
      if( r.value == null ){
        log(r.value);
      } else {
        log(kanjidate.format(kanjidate.f5, r.value));
      }
    } else {
      log(errorMessagesOf(r.errors));
    }
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
      return kanjidate.format(kanjidate.f5, d);
    }
  }
</script>

<Hst.Story>
  <DateForm bind:date bind:validate onChange={doChange} bind:setDate/>
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
