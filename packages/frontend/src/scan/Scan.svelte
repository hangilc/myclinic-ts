<script lang="ts">
  import TopBlock from "./TopBlock.svelte";
  import "/src/app.scss";

  let workarea: HTMLElement;

  function doNewScan(): void {

  }
</script>

<div>
  <TopBlock onNewScan={doNewScan}/>
  <div bind:this={workarea} />
</div>
