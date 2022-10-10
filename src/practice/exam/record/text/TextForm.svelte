<script lang="ts">
  export let onClose: () => void
</script>

<div>
  <textarea></textarea>
  <div>
    <button>入力</button>
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