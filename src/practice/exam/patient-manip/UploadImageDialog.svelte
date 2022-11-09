<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import Pulldown from "@/lib/Pulldown.svelte";

  let dialog: Dialog;
  let tag: string = "other";
  let exampleAnchor: HTMLElement;
  let examples: [string, string][] = [
    ["画像", "image"],
    ["保険証", "hokensho"],
    ["健診結果", "checkup"],
    ["在宅報告", "zaitaku"],
    ["同意書", "douisho"],
    ["その他", "other"],
  ];
  let examplePulldown: Pulldown;

  export function open(): void {
    dialog.open();
  }

  function doExample(): void {
    examplePulldown.open();
  }

  function onClose(): void {}
</script>

<Dialog let:close bind:this={dialog} {onClose}>
  <span slot="title">画像保存</span>
  <div class="tag-wrapper">
    Tag: <input type="text" bind:value={tag} />
    <a href="javascript:void(0)" bind:this={exampleAnchor} on:click={doExample}>例</a>
  </div>
  <form>
    <input type="file" />
  </form>
  <div class="commands">
    <button>保存</button>
    <button on:click={close}>キャンセル</button>
  </div>
</Dialog>
<Pulldown anchor={exampleAnchor} bind:this={examplePulldown}>
  {#each examples as e}
    <a href="javascript:void(0)" on:click={() => tag = e[1]}>{e[0]}</a>
  {/each}
</Pulldown>

<style>
  .tag-wrapper {
    margin: 10px 0;
  }

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .commands * + button {
    margin-left: 4px;
  }
</style>
