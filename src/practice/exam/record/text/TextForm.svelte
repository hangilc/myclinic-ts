<script lang="ts">

  import type * as m from "@/lib/model"
  import api from "@/lib/api"
  import Confirm from "@/lib/Confirm.svelte"
  import type { Op } from "@/lib/drawer/op"
  import ShohousenDrawer from "@/ShohousenDrawerDialog.svelte"

  export let onClose: () => void;
  export let text: m.Text;
  export let index: number | undefined = undefined;
  let textarea: HTMLTextAreaElement;
  let drawerDialog: ShohousenDrawer;

  function onEnter(): void {
    const content = textarea.value;
    const newText: m.Text = Object.assign({}, text, { content });
    if( newText.textId === 0 ){
      api.enterText(newText);
      onClose();
    } else {
      api.updateText(newText);
      onClose();
    }
  }

  let confirmDeleteDialog: Confirm;

  function onDelete(): void {
    confirmDeleteDialog.confirm(() => api.deleteText(text.textId));
  }

  function hasHikitsugi(): boolean {
    return index === 0 && 
      (text.content.startsWith("●") || text.content.startsWith("★"));
  }

  function isShohousen(): boolean {
    return text.content.startsWith("院外処方\nＲｐ）")
  }

  let ops: Op[] = [];

  async function onShohousen() {
    ops = await api.shohousenDrawer(text.textId);
    drawerDialog.open();
  }
 
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <textarea bind:this={textarea}>{text.content}</textarea>
  {#if text.textId === 0}
    <div>
      <button on:click={onEnter}>入力</button>
      <button on:click={onClose}>キャンセル</button>
    </div>
  {:else}
    <div>
      <a href="javascript:void(0)" on:click={onEnter}>入力</a>
      <a href="javascript:void(0)" on:click={onClose}>キャンセル</a>
      {#if hasHikitsugi()}
      <a href="javascript:void(0)">引継ぎコピー</a>
      {/if}
      {#if isShohousen()}
      <a href="javascript:void(0)" on:click={onShohousen}>処方箋</a>
      {/if}
      <a href="javascript:void(0)" on:click={onDelete}>削除</a>
      <a href="javascript:void(0)">コピー</a>
    </div>
    {/if}
</div>

<ShohousenDrawer bind:this={drawerDialog} ops={ops} onClose={onClose} />

<Confirm bind:this={confirmDeleteDialog} text="この文章を削除していいですか？" />

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
  }
</style>