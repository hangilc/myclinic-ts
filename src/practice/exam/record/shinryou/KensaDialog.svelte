<script lang="ts">
  import CheckLabel from "@/lib/CheckLabel.svelte";
import Dialog from "@/lib/Dialog.svelte"
  import type { VisitEx } from "@/lib/model";

  export let kensa: Record<string, string[]>;
  export let visit: VisitEx;
  let dialog: Dialog;
  interface Item {
    label: string,
    checked: boolean,
    value: string
  }
  let leftItems: Item[];
  let rightItems: Item[];

  function mkItem(name: string): Item {
    const index = name.indexOf(":");
    if( index >= 0 ){
      return {
        label: name.substring(0, index),
        checked: false,
        value: name.substring(index+1)
      };
    } else {
      return {
        label: name,
        checked: false,
        value: name
      };
    }
  }

  $: leftItems = kensa.left.map(mkItem);
  $: rightItems = kensa.right.map(mkItem);

  function clearChecks(): void {
    leftItems.forEach(item => item.checked = false);
    rightItems.forEach(item => item.checked = false);
  }

  export function open(): void {
    clearChecks();
    dialog.open();
  }

  async function doEnter() {
    const at = visit.visitedAt.substring(0, 10);
    const visitId = visit.visitId;
    const names = [...leftItems, ...rightItems]
      .filter(item => item.checked)
      .map(item => item.value);
    
  }
</script>

<Dialog let:close={close} bind:this={dialog} width="360px">
  <span slot="title">検査入力</span>
  <div class="two-cols">
    <div class="left">
    {#each leftItems as item}
      {#if item.label.startsWith("---")}
      <div class="leading"></div>
      {:else}
      <div><CheckLabel data={item}/></div>
      {/if}
    {/each}
    </div>
    <div class="right">
    {#each rightItems as item}
    {#if item.label.startsWith("---")}
    <div class="leading"></div>
    {:else}
    <div><CheckLabel data={item}/></div>
    {/if}
  {/each}
    </div>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>

<style>
  .two-cols {
    display: flex;
  }

  .left, .right {
    flex: 0 0 50%;
  }

  .leading {
    height: 1em;
  }
</style>
