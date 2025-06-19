<script lang="ts">
  import type { 備考レコードIndexed } from "./denshi-editor-types";
  import CancelLink from "./icons/CancelLink.svelte";
  import SubmitLink from "./icons/SubmitLink.svelte";
  import TrashLink from "./icons/TrashLink.svelte";

  export let 備考レコード: 備考レコードIndexed[];
  export let onDone: () => void;
  export let onChange: (data: 備考レコードIndexed[]) => void;

  function doNotice() {
    let isEditing = 備考レコード.some((rec) => rec.isEditing);
    if( isEditing ) {
      alert("編集中のレコードがあります。保存してください。");
      return;
    }
    onDone();
    onChange(備考レコード);
  }

  function doEnter(rec: 備考レコードIndexed) {
    rec.orig備考 = rec.備考;
    rec.isEditing = rec.備考 === "";
    備考レコード = 備考レコード;
  }

  function doDelete(rec: 備考レコードIndexed) {
    備考レコード = 備考レコード.filter(r => r.id !== rec.id);
  }

  function doCancel(rec: 備考レコードIndexed) {
    rec.備考 = rec.orig備考;
    rec.isEditing = false;
    備考レコード = 備考レコード;
  }
</script>

<div>備考</div>
{#each 備考レコード as rec (rec.id)}
  {#if rec.isEditing}
    <form on:submit|preventDefault={() => doEnter(rec)}>
      <input type="text" bind:value={rec.備考} />
      {#if rec.備考 !== ""}
      <SubmitLink onClick={() => doEnter(rec)} />
      {/if}
      <TrashLink onClick={() => doDelete(rec)} />
        {#if rec.orig備考 !== ""}
        <CancelLink onClick={() => doCancel(rec)} />
        {/if}
    </form>
  {:else}
    <div>{rec.備考} <TrashLink onClick={() => doDelete(rec)} /></div>
  {/if}
{/each}
<div class="commands">
  <button on:click={doNotice}>入力</button>
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .commands {
    text-align: right;
    padding: 10px;;
  }
</style>