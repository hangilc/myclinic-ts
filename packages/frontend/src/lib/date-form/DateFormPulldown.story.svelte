<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import DateFormPulldown from "./DateFormPulldown.svelte";
  import { format, f5 } from "kanjidate";

  export let Hst: Hst;

  let date: Date | null = new Date();

  function destroy(): void {
    logEvent("destroy", {});
  }

  function doEnter(d: Date | null): void {
    const rep = d === null ? "null" : format(f5, d);
    logEvent("enter", { d: rep });
  }
</script>

<Hst.Story>
  <DateFormPulldown bind:date {destroy} onEnter={doEnter}/>
</Hst.Story>

