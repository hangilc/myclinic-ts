<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import DrawerSvg from "./DrawerSvg.svelte";
  import type { Op } from "./compiler/op";
  import { printApi, type PrintRequest } from "@/lib/printApi";
  import { onMount } from "svelte";
  import * as Base64 from "js-base64";
  import {getBase} from "@lib/api";

  export let destroy: () => void;
  export let ops: Op[] = [];
  export let pages: Op[][] | undefined = undefined;
  export let width: number = 210;
  export let height: number = 297;
  export let scale: number = 1.5;
  export let viewBox: string = `0 0 ${width} ${height}`;
  export let title: string = "プレビュー";
  export let kind: string | undefined = undefined;
  export let onClose: () => void = () => {};
  export let stamp: ArrayBuffer | undefined = undefined;
  export let stampStyle: string = "";
  export let stampPrintOption: { left: number, top: number, width: number, height: number} | undefined = undefined;
  let pageIndex = 0;
  if (pages) {
    adaptToPageIndex();
  }

  function adaptToPageIndex() {
    if (pages) {
      ops = pages[pageIndex];
    }
  }

  function gotoPage(index: number) {
    if (pages) {
      if (index >= 0 && index < pages.length) {
        pageIndex = index;
        adaptToPageIndex();
      }
    }
  }

  let printPref: string = "手動";
  let settingSelect: string = "手動";
  let settingList: string[] = ["手動"];
  let setDefaultChecked = true;

  let base64Data: string = "";
  if (stamp) {
    let bytes = new Uint8Array(stamp);
    let encoded = Base64.fromUint8Array(bytes);
    base64Data = encoded;
  }

  async function print(_close: () => void) {
    if (!stamp) {
      const req: PrintRequest = {
        setup: [],
        pages: pages || [ops],
      };
      await printApi.printDrawer(
        req,
        settingSelect === "手動" ? "" : settingSelect
      );
      if (setDefaultChecked && settingSelect !== printPref && kind) {
        printApi.setPrintPref(kind, settingSelect);
      }
      doClose();
    } else {
      const opsList: Op[][] = pages || [ops];
      const paperSize = "A5";
      let opt = stampPrintOption ?? {
        left: 10, top: 30, width: 15, height: 15
      };
      const body = { paperSize, opsList, outFile: "test.pdf", stamp: base64Data, page: 1, ...opt };
      const result = await fetch(`${getBase()}/create-pdf-file-with-stamp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if( !result.ok ){
        throw new Error(await result.text());
      }
    }
  }

  onMount(async () => {
    const result = await printApi.listPrintSetting();
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
  {#if pages && pages.length >= 2}
    <a href="javascript:void(0)" on:click={() => gotoPage(pageIndex - 1)}
      >&lt;</a
    >
    {pageIndex + 1} / {pages?.length}
    <a href="javascript:void(0)" on:click={() => gotoPage(pageIndex + 1)}
      >&gt;</a
    >
  {/if}
  <DrawerSvg
    {ops}
    {viewBox}
    width={`${width * scale}`}
    height={`${height * scale}`}
  >
    {#if base64Data !== ""}
      <img style={stampStyle} src={`data:image/jpeg;base64,${base64Data}`} alt="stamp"/>
    {/if}</DrawerSvg
  >
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
