<script lang="ts">
  import type { VResult } from "@/lib/validation";
  import type { Hst } from "@histoire/plugin-svelte";
  import Button from "./Button.svelte";
  import { format, f5 } from "kanjidate";

  export let Hst: Hst;
  let date: Date | null = new Date();
  let setDate: (d: Date | null) => void;
  let msg: string = "";

  function doChange(r: VResult<Date | null>): void {
    if( r.isValid ){
      console.log(r.value);
      if( r.value != null ){
        msg = format(f5, r.value);
      }
    }
  }
</script>

<Hst.Story>
  <Button bind:date bind:setDate onChange={doChange}/>
  {msg}
</Hst.Story>

