<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { ShinryouMaster, VisitEx } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { writable, type Writable } from "svelte/store";
  import { enter } from "./helper";

  export let destroy: () => void;
  export let visit: VisitEx;
  let dialog: Dialog;
  let searchTextInput: HTMLInputElement;
  let result: ShinryouMaster[] = [];
  let selected: Writable<ShinryouMaster | null> = writable(null);

  async function doSearch() {
    const text = searchTextInput.value.trim();
    if (text !== "") {
      result = await api.searchShinryouMaster(text, visit.visitedAt);
    }
  }

  async function doEnter() {
    const m = $selected;
    if (m != null) {
      await enter(visit, [m.shinryoucode], []);
    }
  }
</script>

<Dialog {destroy} title="診療行為検索入力">
  <div class="top">
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:this={searchTextInput} use:setFocus />
      <button type="submit">検索</button>
    </form>
  </div>
  <div class="select">
    {#each result as m (m.shinryoucode)}
      <SelectItem {selected} data={m}>
        {m.name}
      </SelectItem>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .top {
    max-width: 16rem;
  }

  .select {
    width: 16rem;
    height: 200px;
    margin-top: 10px;
    resize: vertical;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 4px;
    line-height: 1;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
