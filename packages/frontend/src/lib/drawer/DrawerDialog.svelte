<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import DrawerSvg from "./DrawerSvg.svelte";
  import type { Op } from "./op";
  import { printApi, type PrintRequest } from "@/lib/printApi";
  import { onMount } from "svelte";

  export let destroy: () => void;
  export let ops: Op[];
  export let svgViewBox: string;
  export let svgWidth: string;
  export let svgHeight: string;
  export let title: string = "プレビュー";
  export let kind: string;
  export let onClose: () => void = () => {};

  let printPref: string = "手動";
  let settingSelect: string = "手動";
  let settingList: string[] = ["手動"];
  let setDefaultChecked = true;

  async function print(close: () => void) {
    const req: PrintRequest = {
      setup: [],
      pages: [ops],
    };
    await printApi.printDrawer(req, settingSelect);
    if( setDefaultChecked && settingSelect !== printPref ){
      printApi.setPrintPref(kind, settingSelect);
    }
    close();
  }

  onMount(() =>
    printApi
      .listPrintSetting()
      .then((result) => {
        settingList = ["手動", ...result];
        return printApi.getPrintPref(kind);
      })
      .then((pref) => {
        printPref = pref ?? "手動";
        settingSelect = pref ?? "手動";
      })
  );
</script>

<Dialog {destroy} {onClose} {title}>
  <DrawerSvg {ops} viewBox={svgViewBox} width={svgWidth} height={svgHeight} />
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
    <button on:click={() => close()}>キャンセル</button>
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
