<script lang="ts">
  import { onMount } from "svelte";
  import { printApi, type PrintRequest } from "../printApi";
  import Dialog from "../Dialog.svelte";
  import DrawerSvg from "./DrawerSvg.svelte";
  import type { Op } from "./op";

  export let destroy: () => void;
  export let title: string = "Untitled";
  export let width: number = 210;
  export let height: number = 297;
  export let previewScale: number = 1;
  export let kind: string = "";
  export let ops: Op[] = [];
  export let displayWidth: number | undefined = undefined;
  export let displayHeight: number | undefined = undefined;
  let settingSelect: string = "手動";
  let settingList: string[] = ["手動"];
  let setDefaultChecked = true;
  let storedSettingPref: string = "";
  let drawerSvg: DrawerSvg;

  onMount(async () => {
    const list = await printApi.listPrintSetting();
    settingList = [...settingList, ...list];
    const pref = await printApi.getPrintPref(kind);
    if (pref != null) {
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
    await printApi.printDrawer(
      req,
      settingSelect === "手動" ? undefined : settingSelect
    );
    if (setDefaultChecked && settingSelect !== storedSettingPref) {
      printApi.setPrintPref(kind, settingSelect);
    }
    destroy();
  }

  function doClose(): void {
    destroy();
  }

  function doEnlarge(): void {
    previewScale *= 1.4142;
    drawerSvg.resize(
      (width * previewScale).toString(),
      (height * previewScale).toString()
    );
  }

  function doShrink(): void {
    previewScale /= 1.4142;
    drawerSvg.resize(
      (width * previewScale).toString(),
      (height * previewScale).toString()
    );
  }
</script>

<Dialog {destroy} {title}>
  <DrawerSvg
    {ops}
    viewBox={svgViewBox(width, height)}
    width={(width * previewScale).toString()}
    height={(height * previewScale).toString()}
    displayWidth={displayWidth?.toString() + "px"}
    displayHeight={displayHeight?.toString() + "px"}
    bind:this={drawerSvg}
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
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="22"
      on:click={doEnlarge}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="22"
      on:click={doShrink}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span class="spacer" />
    <button on:click={doPrint}>印刷</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .commands button {
    user-select: none;
  }

  .commands .spacer {
    flex-grow: 1;
  }

  * {
    user-select: none;
  }

  select {
    border: 1px solid gray;
    border-radius: 2px;
    padding: 3px;
  }
</style>
