<script lang="ts">
  import type { 提供診療情報レコードIndexed } from "./denshi-editor-types";
  import CancelLink from "./icons/CancelLink.svelte";
  import SubmitLink from "./icons/SubmitLink.svelte";
  import TrashLink from "./icons/TrashLink.svelte";

  export let 提供診療情報レコード: 提供診療情報レコードIndexed[];
  export let onDone: () => void;
  export let onChange: (records: 提供診療情報レコードIndexed[]) => void;

  function doNotice() {
    let isEditing = 提供診療情報レコード.some((rec) => rec.isEditing);
    if (isEditing) {
      alert("編集中のレコードがあります。保存してください。");
      return;
    }
    onDone();
    onChange(提供診療情報レコード);
  }

  function doEnter(rec: 提供診療情報レコードIndexed) {
    if (rec.コメント.trim() === "") {
      alert("コメントが入力されていません。");
      return;
    }
    rec.orig = {
      薬品名称: rec.薬品名称,
      コメント: rec.コメント,
    };
    rec.isEditing = false;
    提供診療情報レコード = 提供診療情報レコード;
  }

  function doDelete(rec: 提供診療情報レコードIndexed) {
    提供診療情報レコード = 提供診療情報レコード.filter((r) => r.id !== rec.id);
  }

  function doEdit(rec: 提供診療情報レコードIndexed) {
    rec.isEditing = true;
    提供診療情報レコード = 提供診療情報レコード;
  }

  function doCancel(rec: 提供診療情報レコードIndexed) {
    rec.薬品名称 = rec.orig.薬品名称;
    rec.コメント = rec.orig.コメント;
    rec.isEditing = false;
    提供診療情報レコード = 提供診療情報レコード;
  }
</script>

<div>情報提供</div>
{#each 提供診療情報レコード as rec (rec.id)}
  {#if rec.isEditing}
    <form on:submit|preventDefault={() => doEnter(rec)}>
      薬品名称： <input type="text" bind:value={rec.薬品名称} /> <span class="opt">optional</span><br>
      コメント： <input type="text" bind:value={rec.コメント} />
      {#if rec.コメント.trim() !== ""}
        <SubmitLink onClick={() => doEnter(rec)} />
      {/if}
      <TrashLink onClick={() => doDelete(rec)} />
      {#if rec.orig.コメント !== ""}
        <CancelLink onClick={() => doCancel(rec)} style="left:-4px;" />
      {/if}
    </form>
  {:else}
    <div>
      {#if rec.薬品名称}
        <span class="drug-name">{rec.薬品名称}</span>：
      {/if}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span class="editable" on:click={() => doEdit(rec)}>{rec.コメント}</span>
      <TrashLink onClick={() => doDelete(rec)} />
    </div>
  {/if}
{/each}

<div class="commands">
  <button on:click={doNotice}>入力</button>
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .opt {
    color: #999;
  }

  .editable {
    cursor: pointer;
  }

  .drug-name {
    font-weight: bold;
    color: #0066cc;
  }

  .commands {
    text-align: right;
    padding: 10px;;
  }
</style>