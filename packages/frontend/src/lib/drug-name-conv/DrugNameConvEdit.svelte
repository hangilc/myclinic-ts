<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import SmallLink from "../denshi-editor/components/workarea/SmallLink.svelte";
  import { DateWrapper } from "myclinic-util";
  import api from "../api";

  export let id: number;
  export let srcName: string;
  export let dstName: string;
  export let onCancel: () => void;
  export let onEnter: (id: number, srcName: string, dstName: string) => void;
  let searchText = "";
  let masters: IyakuhinMaster[] = [];
  let at = DateWrapper.fromDate(new Date()).asSqlDate();
  let dstMaster: IyakuhinMaster | undefined;
  let chooseIppanmei: boolean = false;

  $: init(id);

  async function init(_id: number) {
    searchText = dstName;
    masters = [];
    dstMaster = undefined;
    chooseIppanmei = false;
    if (dstName !== "") {
      if (dstName.startsWith("【般】")) {
        const ms = await api.listIyakuhinMasterByIppanmei(dstName, at);
        if (ms.length > 0) {
          const m = ms[0];
          dstMaster = m;
          chooseIppanmei = true;
        }
      } else {
        const ms = await api.searchIyakuhinMaster(dstName, at);
        if (ms.length === 1) {
          dstMaster = ms[0];
          chooseIppanmei = false;
        }
      }
    }
  }

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    if (srcName !== "" && dstMaster) {
      onEnter(
        id,
        srcName,
        chooseIppanmei ? dstMaster.ippanmei : dstMaster.name,
      );
    }
  }

  async function doMasterSearch() {
    const t = searchText.trim();
    if (t !== "") {
      if (t.startsWith("【般】")) {
        masters = await api.listIyakuhinMasterByIppanmei(t, at);
      } else {
        masters = await api.searchIyakuhinMaster(t, at);
      }
    }
  }

  function doMasterSelect(m: IyakuhinMaster) {
    dstMaster = m;
    searchText = dstMaster.name;
    chooseIppanmei = false;
    masters = [];
  }

  function isConvertibleToIppanmei(
    dstMaster: IyakuhinMaster | undefined,
    chooseIppanmei: boolean,
  ): boolean {
    return (
      dstMaster !== undefined &&
      dstMaster.ippanmei !== "" &&
      !chooseIppanmei &&
      searchText !== dstMaster.ippanmei
    );
  }

  function doConvertToIppanmei() {
    if (dstMaster && dstMaster.ippanmei !== "") {
      searchText = dstMaster.ippanmei;
      chooseIppanmei = true;
    }
  }
</script>

<div class="field">
  変換元：<input type="text" bind:value={srcName} />
</div>
{#if srcName === ""}
<div class="error">変換元が空白です</div>
{/if}
<div class="field">
  <form on:submit|preventDefault={doMasterSearch}>
    変換先：<input type="text" bind:value={searchText} />
    <SmallLink onClick={doMasterSearch}>マスター検索</SmallLink>
    {#if isConvertibleToIppanmei(dstMaster, chooseIppanmei)}
      <SmallLink onClick={doConvertToIppanmei}>一般名へ</SmallLink>
    {/if}
  </form>
</div>
{#if !(dstMaster && (chooseIppanmei ? dstMaster.ippanmei === searchText : dstMaster.name === searchText))}
<div class="error">マスター検索が必要です</div>
{/if}
<div class="masters">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#each masters as m (m.iyakuhincode)}
    <div on:click={() => doMasterSelect(m)} class="master-item">{m.name}</div>
  {/each}
</div>
<div class="commands">
  {#if srcName !== "" && dstMaster && (chooseIppanmei ? dstMaster.ippanmei === searchText : dstMaster.name === searchText)}
    <button on:click={doEnter}>入力</button>
  {/if}
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .field + .field {
    margin-top: 6px;
  }

  .error {
    border: 1px solid red;
    padding: 10px;
    margin: 10px 0;
    color: red;
  }

  .masters {
    max-height: 200px;
    overflow-y: auto;
    margin: 6px 0;
    resize: vertical;
  }

  .master-item {
    cursor: pointer;
  }

  .commands {
    margin-top: 10px;
  }
</style>
