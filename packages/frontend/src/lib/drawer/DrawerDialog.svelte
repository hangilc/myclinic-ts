<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import DrawerSvg from "./DrawerSvg.svelte";
  import type { Op } from "./compiler/op";
  import { printApi, type PrintRequest } from "@/lib/printApi";
  import { onMount } from "svelte";

  export let destroy: () => void;
  export let ops: Op[];
  export let width: number = 210;
  export let height: number = 297;
  export let scale: number = 1.5;
  export let viewBox: string = `0 0 ${width} ${height}`;
  export let title: string = "プレビュー";
  export let kind: string | undefined = undefined;
  export let onClose: () => void = () => {};

  let printPref: string = "手動";
  let settingSelect: string = "手動";
  let settingList: string[] = ["手動"];
  let setDefaultChecked = true;

  async function print(_close: () => void) {
    const req: PrintRequest = {
      setup: [],
      pages: [ops],
    };
    await printApi.printDrawer(
      req,
      settingSelect === "手動" ? "" : settingSelect
    );
    if (setDefaultChecked && settingSelect !== printPref && kind) {
      printApi.setPrintPref(kind, settingSelect);
    }
    doClose();
  }

  onMount(async () => {
    const result = await printApi.listPrintSetting();
    console.log("result", result);
    console.log("kind", kind);
    settingList = ["手動", ...result];
    let pref: string | null = null;
    if (kind) {
      pref = await printApi.getPrintPref(kind);
    }
    printPref = pref ?? "手動";
    settingSelect = pref ?? "手動";
  });

  function doClose(): void {
    destroy();
    onClose();
  }
</script>

<Dialog {destroy} {onClose} {title}>
  <DrawerSvg
    {ops}
    {viewBox}
    width={`${width * scale}`}
    height={`${height * scale}`}
  />
  <div>
    <span>設定</span>
    <select bind:value={settingSelect}>
      {#each settingList as setting}
        <option>{setting}</option>
      {/each}
    </select>
    <input type="checkbox" bind:checked={setDefaultChecked} /> 既定に
    <a href="http://localhost:48080/" target="_blnak">管理画面表示</a>
  </div>
  <div class="commands">
    <button on:click={() => print(close)}>印刷</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
