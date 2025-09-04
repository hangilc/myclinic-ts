<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import SmallLink from "../denshi-editor/components/workarea/SmallLink.svelte";
  import { DateWrapper } from "myclinic-util";
  import api from "../api";

  export let invokeId: number;
  export let srcName: string;
  export let onCancel: () => void;
  export let onEnter: (srcName: string, dstName: string) => void;
  let searchText = "";
  let masters: IyakuhinMaster[] = [];
  let at = DateWrapper.fromDate(new Date()).asSqlDate();
  let dstMaster: IyakuhinMaster | undefined;
  let chooseIppanmei: boolean = false;

  $: reset(invokeId);

  function reset(_invokeId: number) {
    searchText = "";
    dstMaster = undefined;
    chooseIppanmei = false;
  }

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    if( srcName !== "" && dstMaster ){
      onEnter(srcName, dstMaster.name);
    }
  }

  async function doMasterSearch() {
    const t = searchText.trim();
    if( t !== "" ){
      masters = await api.searchIyakuhinMaster(t, at);
      searchText = "";
    }
  }

  function doMasterSelect(m: IyakuhinMaster) {
    dstMaster = m;
  }

  function dstValue(): string {

  }
</script>

<div class="field">
  変換元：<input type="text" bind:value={srcName} />
</div>
<div class="field">
  変換先：<input type="text" bind:value={} />
  <SmallLink onClick={doMasterSearch}>マスター検索</SmallLink>
</div>
<div class="masters">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#each masters as m (m.iyakuhincode)}
    <div on:click={() => doMasterSelect(m)}>{m.name}</div>
  {/each}
</div>
<div class="commands">
  {#if srcName !== "" && dstName !== ""}
    <button on:click={doEnter}>入力</button>
  {/if}
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .field + .field {
    margin-top: 6px;
  }

  .masters {
    max-height: 100px;
    overflow-y: auto;
    margin: 6px 0;
  }

  .commands {
    margin-top: 10px;
  }
</style>
