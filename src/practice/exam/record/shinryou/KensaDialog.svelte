<script lang="ts">
  import CheckLabel from "@/lib/CheckLabel.svelte";
  import Dialog from "@/lib/Dialog.svelte"
  import type { VisitEx } from "@/lib/model";
  import { enter } from "./helper"

  export let visit: VisitEx;
  let dialog: Dialog;
  interface Item {
    label: string,
    checked: boolean,
    value: string,
    preset: boolean,
  }
  let leftItems: Item[] = [];
  let rightItems: Item[] = [];

  function mkItem(name: string, preset: string[]): Item {
    const index = name.indexOf(":");
    if( index >= 0 ){
      const value = name.substring(index+1);
      return {
        label: name.substring(0, index),
        checked: false,
        value: value,
        preset: preset.includes(value)
      };
    } else {
      return {
        label: name,
        checked: false,
        value: name,
        preset: preset.includes(name)
      };
    }
  }

  export function open(kensa: Record<string, string[]>): void {
    const preset: string[] = kensa.preset;
    leftItems = kensa.left.map(name => mkItem(name, preset));
    rightItems = kensa.right.map(name => mkItem(name, preset));
    dialog.open();
  }

  function doPreset(): void {
    function preset(items: Item[]): Item[] {
      items.forEach(item => {
        if( item.preset ){
          item.checked = true;
        }
      })
      return items;
    }
    leftItems = preset(leftItems);
    rightItems = preset(rightItems);
  }

  function doClear(): void {
    function clear(items: Item[]): Item[] {
      items.forEach(item => item.checked = false);
      return items;
    }
    leftItems = clear(leftItems);
    rightItems = clear(rightItems);
  }

  async function doEnter() {
    const at = visit.visitedAt.substring(0, 10);
    const visitId = visit.visitId;
    const names: string[] = 
      [...leftItems, ...rightItems].filter(item => item.checked).map(item => item.value);
    await enter(visit, names, []);
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
      <div><CheckLabel bind:checked={item.checked} label={item.label}/></div>
      {/if}
    {/each}
    </div>
    <div class="right">
    {#each rightItems as item}
      {#if item.label.startsWith("---")}
      <div class="leading"></div>
      {:else}
      <div><CheckLabel bind:checked={item.checked} label={item.label}/></div>
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
