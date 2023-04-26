<script lang="ts">
  import { onMount } from "svelte";
  import { printApi, type PrintRequest } from "../printApi";
  import SurfaceModal from "../SurfaceModal.svelte";
  import DrawerSvg from "./DrawerSvg.svelte";
  import type { Op } from "./op";

  export let destroy: () => void;
  export let title: string = "Untitled";
  export let width: number = 210;
  export let height: number = 297;
  export let previewScale: number = 1;
  export let kind: string = "";
  export let ops: Op[] = [];
  let settingSelect: string = "手動";
  let settingList: string[] = ["手動"];
  let setDefaultChecked = true;
  let storedSettingPref: string = "";

  onMount(async () => {
    const list = await printApi.listPrintSetting();
    settingList = [...settingList, ...list];
    const pref = await printApi.getPrintPref(kind);
    if( pref != null ){
      settingSelect = pref;
      storedSettingPref = pref;
    }
  });

  function svgViewBox(width: number, height: number): string {
    return `0 0 ${width} ${height}`;
  }

  async function doPrint() {
    const req: PrintRequest = {
      setup: [],
      pages: [ops],
    };
    await printApi.printDrawer(req, settingSelect === "手動" ? undefined : settingSelect);
    if (setDefaultChecked && settingSelect !== storedSettingPref) {
      printApi.setPrintPref(kind, settingSelect);
    }
    destroy();
  }

  function doClose(): void {
    destroy();
  }
</script>

<SurfaceModal {destroy} {title}>
  <DrawerSvg
    {ops}
    viewBox={svgViewBox(width, height)}
    width={(width * previewScale).toString()}
    height={(height * previewScale).toString()}
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
    <button on:click={doPrint}>印刷</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
