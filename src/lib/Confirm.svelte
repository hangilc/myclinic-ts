<script lang="ts">

  import Dialog from "./Dialog.svelte"

  let dialog: Dialog;
  let proc: () => void;
  export function confirm(f: () => void): void {
    proc = f;
    dialog.open();
  }
  export let text: string;

</script>

<Dialog let:close={close} noTitle bind:this={dialog} width="">
  <div>{text}</div>
  <svelte:fragment slot="commands">
    <button on:click={() => {
      close();
      proc();
    }}>はい</button>
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>
