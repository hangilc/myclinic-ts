<script lang="ts">

  import Dialog from "./Dialog.svelte"

  export let destroy: () => void;
  export let yesProc: () => void;
  export let noProc: () => void;

  export let text: string;

  function doYes(close: () => void): void {
    close();
    yesProc();
  }

  function doNo(close: () => void): void {
    close();
    noProc();
  }
</script>

<Dialog {destroy} title="確認">
  <div class="content" data-cy="text">{text}</div>
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
    height: auto;
    width: auto;
    min-height: 30px;
    max-height: 300px;
  }

  .commands {
    text-align: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
