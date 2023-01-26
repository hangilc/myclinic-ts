<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import FormTemplate from "./FormTemplate.svelte";

  export let Hst: Hst;
  type DATA_TYPE = { num: number };
  const logs: string[] = [];

  let data: DATA_TYPE = { num: 0 };

  function log(t: string): void {
    
  }

  function onValueChange(evt: CustomEvent<VResult<DATA_TYPE>>): void {
    const r = evt.detail;
    if( r.isValid ){
      const d: DATA_TYPE = r.value;
      console.log("data", d);
    } else {
      console.log("error", errorMessagesOf(r.errors) );
    }
  }
</script>

<Hst.Story>
  <FormTemplate bind:data on:value-change={onValueChange}/>
  <button on:click={() => data = ({ num: data.num + 2 })}>Click</button>
</Hst.Story>
<div class="log">
  {#each logs as log}
  <div>{log}</div>
  {/each}
</div>
