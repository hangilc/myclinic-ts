<script lang="ts">
  
  import Dialog from "../Dialog.svelte"
  import DrawerSvg from "./DrawerSvg.svelte"
  import type { Op } from "./op"
  import { printApi, type PrintRequest } from "@/lib/printApi"

  export let ops: Op[];
  export let svgViewBox: string;
  export let svgWidth: string;
  export let svgHeight: string;
  export let title: string = "プレビュー";
  export let kind: string;
  let dialog: Dialog;
  export function open(): void {
    dialog.open();
  }
  export let onClose: () => void = () => {};
  let printPref: string = "";

  function print(): void {
    const req: PrintRequest = {
      setup: [],
      pages: [ops]
    }
    const setting = "";
    printApi.printDrawer(req, setting);
  }

  $: printApi.getPrintPref(kind).then(pref => {
    printPref = pref;
  })

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog let:close={close} bind:this={dialog} width="" onClose={onClose}>
  <span slot="title">{title}</span>
  <DrawerSvg ops={ops} viewBox={svgViewBox} width={svgWidth} height={svgHeight} />
  <div>
    <span>設定</span>
    <select>
      <option value="">手動</option>
      {#await printApi.listPrintSetting()}
        <option></option>
      {:then list}
        {#each list as s}
        <option value={s} selected={s == printPref}>{s}</option>
        {/each}
      {/await}  
      </select>
    <input type="checkbox" checked> 既定に
    <a href="http://localhost:48080/" target="_blnak">管理画面表示</a>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={print}>印刷</button>
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>

