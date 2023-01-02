<script lang="ts">

  import Dialog from "./Dialog.svelte"

  let dialog: Dialog;
  let proc: () => void;
  let no: () => void;

  export function confirm(f: () => void, g: () => void = () => {}): void {
    proc = f;
    no = g;
    dialog.open();
  }
  export let text: string;

  function doYes(close: () => void): void {
    close();
    proc();
  }

  function doNo(close: () => void): void {
    close();
    no();
  }
</script>

<Dialog let:close={close} noTitle bind:this={dialog} width="">
  <div>{text}</div>
  <svelte:fragment slot="commands">
    <button on:click={() => doYes(close)}>はい</button>
    <button on:click={() => doNo(close)}>キャンセル</button>
  </svelte:fragment>
</Dialog>
