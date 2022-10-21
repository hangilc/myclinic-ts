<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte"
  import type { ShinryouMaster, VisitEx } from "@/lib/model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { setFocus } from "@/lib/set-focus"
  import { writable, type Writable } from "svelte/store";
  import { enter } from "./helper"

  export let visit: VisitEx
  let dialog: Dialog;
  let searchTextInput: HTMLInputElement;
  let result: ShinryouMaster[] = [];
  let selected: Writable<ShinryouMaster | null> = writable(null);

  export function open(): void {
    dialog.open();
  }

  async function doSearch() {
    const text = searchTextInput.value.trim();
    if( text !== "" ){
      result = await api.searchShinryouMaster(text, visit.visitedAt);
      console.log(result);
    }
  }

  async function doEnter() {
    const m = $selected;
    if( m != null ){
      await enter(visit, [m.shinryoucode], []);
    }
  }
</script>

<Dialog bind:this={dialog} let:close={close}>
  <span slot="title">診療行為検索入力</span>
  <div>
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:this={searchTextInput} use:setFocus/>
      <button type="submit">検索</button>
    </form>
  </div>
  <div class="select">
    {#each result as m (m.shinryoucode)}
    <SelectItem selected={selected} data={m}>
      {m.name}
    </SelectItem>
    {/each}
  </div>
  <svelte:fragment slot="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Dialog>

<style>
  .select {
    height: 200px;
    margin-top: 10px;
  }
</style>