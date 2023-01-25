<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { errorMessagesOf, type VResult } from "../validation";
  import DateFormWithCalendar from "./DateFormWithCalendar.svelte";
  import { format, f5  } from "kanjidate";

  export let Hst: Hst;
  let date: Date | null = new Date();
  let logs: string[] = [];
  let setDate: (d: Date | null) => void = d => date = d;

  function log(arg: any): void {
    const t = JSON.stringify(arg, undefined, 2);
    logs = [t, ...logs];
  }

  function doChange(evt: CustomEvent<VResult<Date | null>>): void {
    const r = evt.detail;
    if( r.isValid ){
      if( r.value == null ){
        log(r.value);
      } else {

        log(format(f5, r.value));
      }
    } else {
      log(errorMessagesOf(r.errors));
    }
  }

  function doSet(): void {
    const d = new Date(2022, 3, 12);
    setDate(d);
  }

  function doNull(): void {
    setDate(null);
  }
</script>

<Hst.Story>
  <DateFormWithCalendar bind:date={date} on:value-change={doChange}/>
  <button on:click={doSet}>Set</button>
  <button on:click={doNull}>Null</button>
  <div class="date-box">
    { date == null ? "(null)" : format(f5, date)}
    <button on:click={() => logs = []}>clear logs</button>
  </div>
  <div class="logs">
    {#each logs as log}
      <pre>{log}</pre>
    {/each}
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

