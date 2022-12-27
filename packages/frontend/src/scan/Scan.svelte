<script lang="ts">
  import { Block, BlockKind } from "./block";
  import ImagesBlock from "./ImagesBlock.svelte";
  import ScanBlock from "./ScanBlock.svelte";
  import TopBlock from "./TopBlock.svelte";
  import "/src/app.scss";

  let blocks: Block[] = [];

  function doNewScan(): void {
    blocks = [new Block(BlockKind.Scan), ...blocks];
  }

  function doSavedImages(): void {
    blocks = [new Block(BlockKind.Images), ...blocks];
  }

  function removeBlock(id: number): void {
    blocks = blocks.filter((b) => b.blockId !== id);
  }
</script>

<div>
  <TopBlock onNewScan={doNewScan} onSavedImages={doSavedImages} />
  <div>
    {#each blocks as block (block.blockId)}
      {@const remove = () => removeBlock(block.blockId)}
      {#if block.blockKind === BlockKind.Scan}
        <ScanBlock {remove} />
      {:else if block.blockKind === BlockKind.Images}
        <ImagesBlock {remove} />
      {/if}
    {/each}
  </div>
</div>
