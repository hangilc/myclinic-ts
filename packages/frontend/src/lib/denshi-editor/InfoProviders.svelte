<script lang="ts">
  import type { 提供診療情報レコードIndexed } from "./denshi-editor-types";

  export let 提供診療情報レコード: 提供診療情報レコードIndexed[];

  function doEnter(rec: 提供診療情報レコードIndexed) {
    rec.orig = Object.assign({}, rec.orig, {
      提供診療情報: rec.提供診療情報,
    });
    rec.isEditing = false;
  }
</script>

{#each 提供診療情報レコード as rec (rec.id)}
  {#if rec.isEditing}
    <form on:submit|preventDefault={() => doEnter(rec)}>
      薬品名称： <input type="text" bind:value={rec.薬品名称} /> <span class="opt">optional</span>
    </form>
  {:else}
  {/if}
{/each}

<style>
  .opt {
    color: #999;
  }
</style>