<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { errorMessagesOf, type VResult } from "../validation";
  import DateForm from "./DateForm.svelte";
  import * as kanjidate from "kanjidate";

  export let Hst: Hst;
  let date: Date = new Date();
  let validate: () => VResult<Date | null>;
  let logs: string[] = [];
  let resetDate: (d: Date | null) => void;

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
    const d = new Date(2022, 3, 12);
    resetDate(d);
  }

  function doNull(): void {
    resetDate(null);
  }
</script>

<Hst.Story>
  <DateForm bind:date bind:validate onChange={doChange} bind:resetDate/>
  <button on:click={doSet}>Set</button>
  <button on:click={doNull}>Null</button>
  <div class="date-box">
    { date == null ? "(null)" : kanjidate.format(kanjidate.f5, date)}
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
