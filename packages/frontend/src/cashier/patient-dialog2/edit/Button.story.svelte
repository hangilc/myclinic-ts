<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import Button from "./Button.svelte";

  export let Hst: Hst;

  let data: number = 0;

  function onValueChange(evt: CustomEvent<VResult<number>>): void {
    logEvent("value", { detail: evt.detail})
  }
</script>

<Hst.Story>
  <Button bind:data on:value-change={onValueChange}/>
  <button on:click={() => data = data + 2}>Click</button>
</Hst.Story>
