<script lang="ts">
  import ScanBlock from "./ScanBlock.svelte";
  import TopBlock from "./TopBlock.svelte";
  import "/src/app.scss";

  let scanSer = 1;
  let scanIds: number[] = [];

  function doNewScan(): void {
    scanIds = [scanSer++, ...scanIds];
  }
</script>

<div>
  <TopBlock onNewScan={doNewScan} />
  <div>
    {#each scanIds as scanId (scanId)}
      <ScanBlock/>
    {/each}
  </div>
</div>
