<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import Pulldown from "@/lib/Pulldown.svelte";
  import { getFileExtension } from "@/lib/file-ext";
  import { pad } from "@/lib/pad";

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
  let fileInput: HTMLInputElement;
  let form: HTMLFormElement;

  export function open(): void {
    dialog.open();
  }

  function doExample(): void {
    examplePulldown.open();
  }

  async function doSave() {
    const at = new Date();
    const formData = new FormData();
    const files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = getFileExtension(f);
    }
  }

  function onClose(): void {
    tag = "";
    form.reset();
  }

  function zeroPad(n): string {
    return pad(n, 2, "0");
  }

  function composeFileName(
    patientId: number,
    tag: string,
    at: Date,
    index: number,
    ext: string
  ): string {
    const year = at.getFullYear();
    const month = zeroPad(at.getMonth() + 1);
    const day = zeroPad(at.getDate());
    const hour = zeroPad(at.getHours());
    const minute = zeroPad(at.getMinutes());
    const second = zeroPad(at.getSeconds());
    const stamp = `${month}`;
  }
</script>

<Dialog let:close bind:this={dialog} {onClose}>
  <span slot="title">画像保存</span>
  <div class="tag-wrapper">
    Tag: <input type="text" bind:value={tag} />
    <a href="javascript:void(0)" bind:this={exampleAnchor} on:click={doExample}
      >例</a
    >
  </div>
  <form bind:this={form}>
    <input type="file" bind:this={fileInput} />
  </form>
  <div class="commands">
    <button on:click={doSave}>保存</button>
    <button on:click={close}>キャンセル</button>
  </div>
</Dialog>
<Pulldown anchor={exampleAnchor} bind:this={examplePulldown}>
  {#each examples as e}
    <a href="javascript:void(0)" on:click={() => (tag = e[1])}>{e[0]}</a>
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
