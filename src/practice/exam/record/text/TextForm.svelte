<script lang="ts">

  import type * as m from "@/lib/model"
  import api from "@/lib/api"

  export let onClose: () => void;
  export let text: m.Text;
  let textarea: HTMLTextAreaElement;

  function onEnter(): void {
    const content = textarea.value;
    const newText: m.Text = Object.assign({}, text, { content });
    if( newText.textId === 0 ){
      api.enterText(newText);
      onClose();
    }
  }
  
</script>

<div>
  <textarea bind:this={textarea}>{text.content}</textarea>
  <div>
    <button on:click={onEnter}>入力</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</div>

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
  }
</style>