<script lang="ts">
  import Dialog from "./DialogOld.svelte"

  export let message: string;
  export let onClose: () => void = () => {};

  let dialog: Dialog;

  export function open(): void {
    dialog.open();
  }
</script>

<Dialog let:close={close} onClose={onClose} bind:this={dialog}>
  <span class="title" slot="title">エラー</span>
  <div>{message}</div>
  <svelte:fragment slot="commands">
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Dialog>

<style>
  .title {
    color: red;
  }
</style>