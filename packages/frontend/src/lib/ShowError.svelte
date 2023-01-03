<script lang="ts">
  import Dialog from "./Dialog.svelte"

  export let destroy: () => void;
  export let message: string;
  export let onClose: () => void = () => {};

</script>

<Dialog {destroy} onClose={onClose} title="エラー">
  <div class="message">{message}</div>
  <div class="commands">
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .message {
    color: red;
    max-width: 300px;
    margin: 10px 0;
  }

  .commands {
    text-align: right;
  }
</style>