<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";
  import type { Shohou } from "../parse-shohou";
  import { createConvGroupRep, type ConvGroupRep } from "./conv/conv-types";
  import ConvRep from "./conv/ConvRep.svelte";

  export let destroy: () => void;
  export let shohou: Shohou;
  let groups = shohou.groups.map(g => createConvGroupRep(g));

  function doDrugSelected(group: ConvGroupRep, index: number) {
    let drug = group.drugs[index];
    if( drug.converted ){

    } else {
      
    }
  }
</script>

<Dialog2 title="処方箋電子変換" {destroy}>
  <div class="denshi-editor wrapper">
    <div class="left">
      <ConvRep bind:groups onDrugSelected={doDrugSelected}/>
    </div>
    <div>

    </div>
  </div>
</Dialog2>

<style>
  .wrapper {
    width: 800px;
    height: 600px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    padding: 10px;
  }

  .left {
    border-right: 1px solid gray;
  }
</style>