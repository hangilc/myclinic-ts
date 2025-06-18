<script lang="ts">
  import type { 用法補足レコードIndexed } from "../denshi-editor-types";

  export let 用法補足レコード: 用法補足レコードIndexed[];

  function doEnter(rec: 用法補足レコードIndexed) {
    rec.orig = Object.assign({}, rec.orig, {
      用法補足情報: rec.用法補足情報
    });
    rec.isEditing = false;
    用法補足レコード = 用法補足レコード;
  }
</script>

{#each 用法補足レコード as rec (rec.id)}
  {#if rec.用法補足区分 === "用法の続き"}
    {#if rec.isEditing}
      用法の続き：
      <form on:submit|preventDefault={() => doEnter(rec)} >
        <input type="text" bind:value={rec.用法補足情報} />
      </form>
    {:else}
      <div>{rec.用法補足情報}</div>
    {/if}
  {:else}
    <div>{rec.用法補足情報}</div>
  {/if}
{/each}
