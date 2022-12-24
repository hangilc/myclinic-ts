<script lang="ts">
  import ScanBlock from "./ScanBlock.svelte";
  import TopBlock from "./TopBlock.svelte";
  import "/src/app.scss";

  let scanSer = 1;
  let scanIds: number[] = [];

  function doNewScan(): void {
    scanIds = [scanSer++, ...scanIds];
  }

  function removeBlock(id: number): void {
    scanIds = scanIds.filter(e => e !== id);
  }
</script>

<div>
  <TopBlock onNewScan={doNewScan} />
  <div>
    {#each scanIds as scanId (scanId)}
      <ScanBlock remove={() => removeBlock(scanId)}/>
    {/each}
  </div>
</div>
