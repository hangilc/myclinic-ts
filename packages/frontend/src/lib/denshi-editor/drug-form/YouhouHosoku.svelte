<script lang="ts">
  import { receiveMessageOnPort } from "worker_threads";
  import type { 用法補足レコードIndexed } from "../denshi-editor-types";
  import CancelLink from "../icons/CancelLink.svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let 用法補足レコード: 用法補足レコードIndexed[];

  function doEnter(rec: 用法補足レコードIndexed) {
    rec.orig = Object.assign({}, rec.orig, {
      用法補足情報: rec.用法補足情報,
    });
    rec.isEditing = false;
    用法補足レコード = 用法補足レコード;
  }

  function doDelete(rec: 用法補足レコードIndexed) {
    用法補足レコード = 用法補足レコード.filter((r) => r.id !== rec.id);
  }

  function doEdit(rec: 用法補足レコードIndexed) {
    rec.isEditing = true;
    用法補足レコード = 用法補足レコード;
  }

  function doCancel(rec: 用法補足レコードIndexed) {
    rec.isEditing = false;
    rec.用法補足情報 = rec.orig.用法補足情報;
    用法補足レコード = 用法補足レコード;
  }
</script>

{#each 用法補足レコード as rec (rec.id)}
  {#if rec.用法補足区分 === "用法の続き"}
    {#if rec.isEditing}
      <form on:submit|preventDefault={() => doEnter(rec)}>
        用法の続き：<input type="text" bind:value={rec.用法補足情報} />
        {#if rec.用法補足情報 !== ""}
          <SubmitLink onClick={() => doEnter(rec)} />
        {/if}
        <TrashLink onClick={() => doDelete(rec)} />
        <CancelLink onClick={() => doCancel(rec)} />
      </form>
    {:else}
      <div>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="editable" on:click={() => doEdit(rec)}
          >{rec.用法補足情報}</span
        >
        <TrashLink onClick={() => doDelete(rec)} />
      </div>
    {/if}
  {:else}
    <div>{rec.用法補足情報} <TrashLink onClick={() => doDelete(rec)} /></div>
  {/if}
{/each}

<style>
  .editable {
    cursor: pointer;
  }
</style>
