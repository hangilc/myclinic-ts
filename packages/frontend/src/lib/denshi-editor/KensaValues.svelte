<script lang="ts">
  import type { 検査値データ等レコードIndexed } from "./denshi-editor-types";
  import CancelLink from "./icons/CancelLink.svelte";
  import SubmitLink from "./icons/SubmitLink.svelte";
  import TrashLink from "./icons/TrashLink.svelte";

  export let 検査値データ等レコード: 検査値データ等レコードIndexed[];
  export let onDone: () => void;
  export let onChange: (records: 検査値データ等レコードIndexed[]) => void;

  function doNotice() {
    let isEditing = 検査値データ等レコード.some(rec => rec.isEditing);
    if (isEditing) {
      alert("編集中のレコードがあります。保存してください。");
      return;
    }
    onDone();
    onChange(検査値データ等レコード);
  }

  function doEnter(rec: 検査値データ等レコードIndexed) {
    if (rec.検査値データ等.trim() === "") {
      alert("検査値データ等が入力されていません。");
      return;
    }
    rec.orig = { 検査値データ等: rec.検査値データ等 };
    rec.isEditing = false;
    検査値データ等レコード = 検査値データ等レコード;
  }

  function doDelete(rec: 検査値データ等レコードIndexed) {
    検査値データ等レコード = 検査値データ等レコード.filter(r => r.id !== rec.id);
  }

  function doEdit(rec: 検査値データ等レコードIndexed) {
    rec.isEditing = true;
    検査値データ等レコード = 検査値データ等レコード;
  }

  function doCancel(rec: 検査値データ等レコードIndexed) {
    rec.検査値データ等 = rec.orig.検査値データ等;
    rec.isEditing = false;
    検査値データ等レコード = 検査値データ等レコード;
  }
</script>

<div>検査値データ等</div>
{#each 検査値データ等レコード as rec (rec.id)}
  {#if rec.isEditing}
    <form on:submit|preventDefault={() => doEnter(rec)}>
      <input type="text" bind:value={rec.検査値データ等} />
      {#if rec.検査値データ等.trim() !== ""}
        <SubmitLink onClick={() => doEnter(rec)} />
      {/if}
      <TrashLink onClick={() => doDelete(rec)} />
      {#if rec.orig.検査値データ等 !== ""}
        <CancelLink onClick={() => doCancel(rec)} style="left:-4px;" />
      {/if}
    </form>
  {:else}
    <div>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span class="editable" on:click={() => doEdit(rec)}>{rec.検査値データ等}</span>
      <TrashLink onClick={() => doDelete(rec)} />
    </div>
  {/if}
{/each}

<div class="commands">
  <button on:click={doNotice}>入力</button>
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .editable {
    cursor: pointer;
  }

  .commands {
    text-align: right;
    padding: 10px;
  }
</style>
