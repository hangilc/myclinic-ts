<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";
  import Commands from "./components/Commands.svelte";
  import type { TopTmpl } from "./denshi-tmpl";

  export let title: string;
  export let destroy: () => void;
  export let topTmpl: TopTmpl;

  function doCancel() {
    destroy();
  }
</script>

<Dialog2 {title} {destroy}>
  <div class="top">
    <div class="left">
      <Commands onCancel={doCancel}/>
    </div>
    <div class="workarea">

    </div>
  </div>
</Dialog2>

<style>
  .top {
    margin: 0 10px 10px 10px;
    width: 760px;
    height: 600px;
    display: grid;
    grid-template-columns: 50% 1fr;
    gap: 10px;
    padding: 0 10px 10px 10px;
    overflow-y: auto;
  }

  .left {

  }
</style>
