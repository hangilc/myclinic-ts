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
    value: string,
    preset: boolean,
  }
  let leftItems: Item[];
  let rightItems: Item[];

  function mkItem(name: string): Item {
    const index = name.indexOf(":");
    if( index >= 0 ){
      const value = name.substring(index+1);
      return {
        label: name.substring(0, index),
        checked: false,
        value: value,
        preset: kensa.preset.includes(value)
      };
    } else {
      return {
        label: name,
        checked: false,
        value: name,
        preset: kensa.preset.includes(name)
      };
    }
  }

  $: leftItems = kensa.left.map(mkItem);
  $: rightItems = kensa.right.map(mkItem);

  function allItems(): Item[] {
    return [...leftItems, ...rightItems];
  }

  function clearChecks(): void {
    allItems().forEach(item => item.checked = false);
  }

  export function open(): void {
    clearChecks();
    dialog.open();
  }

  function doPreset(): void {
    allItems().filter(item => item.preset).forEach(item => {
      console.log("preset", item.label);
      item.checked = true
    });
  }

  function doClear(): void {
    clearChecks();
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
      <div><CheckLabel data={item} bind:checked={item.checked}/></div>
      {/if}
    {/each}
    </div>
    <div class="right">
    {#each rightItems as item}
    {#if item.label.startsWith("---")}
    <div class="leading"></div>
    {:else}
    <div><CheckLabel data={item} bind:checked={item.checked}/></div>
    {/if}
  {/each}
    </div>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={doPreset}>セット検査</button>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClear}>クリア</button>
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
