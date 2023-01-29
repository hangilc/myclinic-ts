<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import DateForm from "./DateForm.svelte";
  import { format, f5 } from "kanjidate";
  import type { VResult } from "../validation";

  export let Hst: Hst;
  let date: Date | null = new Date();
  let logs: string[] = [];
  let setDate: (d: Date | null) => void;
  let validate: () => VResult<Date | null>;

  function log(what: string, arg: any): void {
    const t = JSON.stringify(arg, undefined, 2);
    logs = [`${what}: ${t}`, ...logs];
  }

  function doChange(): void {
    log("change", validate());
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
  <DateForm init={date} on:value-change={doChange} bind:validate bind:setValue={setDate}/>
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
