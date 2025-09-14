<script lang="ts">
  import type { UsageMaster } from "myclinic-model";
  import SmallLink from "../denshi-editor/components/workarea/SmallLink.svelte";
  import api from "../api";
  import Link from "@/practice/ui/Link.svelte";

  export let id: number;
  export let srcName: string;
  export let dstName: string;
  export let onCancel: () => void;
  export let onEnter: (id: number, srcName: string, dstName: string) => void;
  export let onDelete: (srcName: string) => void;
  let searchText = "";
  let masters: UsageMaster[] = [];
  let dstMaster: UsageMaster | undefined;

  $: init(id);

  async function init(_id: number) {
    searchText = dstName;
    masters = [];
    dstMaster = undefined;
    if (dstName !== "") {
      const ms = await api.selectUsageMasterByUsageName(dstName);
      if (ms.length === 1) {
        dstMaster = ms[0];
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
        dstMaster.usage_name,
      );
    }
  }

  async function doMasterSearch() {
    const t = searchText.trim();
    if (t !== "") {
        masters = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doMasterSelect(m: UsageMaster) {
    dstMaster = m;
    searchText = dstMaster.usage_name;
    masters = [];
  }

  function doDelete() {
    onDelete(srcName);
  }

</script>

<div class="field">
  変換元：<input type="text" bind:value={srcName} />
</div>
<div class="field">
  <form on:submit|preventDefault={doMasterSearch}>
    変換先：<input type="text" bind:value={searchText} />
    <SmallLink onClick={doMasterSearch}>マスター検索</SmallLink>
  </form>
</div>
<div class="masters">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#each masters as m (m.usage_code)}
    <div on:click={() => doMasterSelect(m)} class="master-item">{m.usage_name}</div>
  {/each}
</div>
<div class="commands">
  <Link onClick={doDelete}>削除</Link>
  {#if srcName !== "" && dstMaster}
    <button on:click={doEnter}>入力</button>
  {/if}
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .field + .field {
    margin-top: 6px;
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
