<script lang="ts">

  import Dialog from "./Dialog.svelte"

  export let destroy: () => void;
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

<Dialog {destroy} title="確認">
  <div class="content">{text}</div>
  <div class="commands">
    <button on:click={() => doYes(destroy)}>はい</button>
    <button on:click={() => doNo(destroy)}>キャンセル</button>
  </div>
</Dialog>

<style>
  .content {
    margin: 10px 0;
    min-width: 100px;
    max-width: 400px;
    overflow: auto;
  }

  .commands {
    text-align: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
