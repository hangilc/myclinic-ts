<script lang="ts">

  import type * as m from "@/lib/model"
  import api from "@/lib/api"
  import Confirm from "@/lib/Confirm.svelte"
    import { loop_guard } from "svelte/internal";

  export let onClose: () => void;
  export let text: m.Text;
  let textarea: HTMLTextAreaElement;

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
      <a href="javascript:void(0)">引継ぎコピー</a>
      <a href="javascript:void(0)" on:click={onDelete}>削除</a>
      <a href="javascript:void(0)">コピー</a>
    </div>
    {/if}
</div>

<Confirm bind:this={confirmDeleteDialog} text="この文章を削除していいですか？" />

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
  }
</style>