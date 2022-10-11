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
  let dialog: Dialog;
  export function open(): void {
    dialog.open();
  }
  export let onClose: () => void = () => {};

  function print(): void {
    const req: PrintRequest = {
      setup: [],
      pages: [ops]
    }
    const setting = "";
    printApi.printDrawer(req, setting);
  }

  printApi.listPrintSetting().then(list => {
    console.log(list);
  })

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog let:close={close} bind:this={dialog} width="" onClose={onClose}>
  <span slot="title">{title}</span>
  <DrawerSvg ops={ops} viewBox={svgViewBox} width={svgWidth} height={svgHeight} />
  <div>
    <span>設定</span>
    <select><option>手動</option></select>
    <input type="checkbox"> 既定に
    <a href="javascript:void(0)">管理画面表示</a>
  </div>
  <!-- {#await printApi.listPrintSetting()}
    <div></div>
  {:then list}
    {#each list as s}
    <div>{s}</div>
    {/each}
  {/await}   -->
  <svelte:fragment slot="commands">
    <button on:click={print}>印刷</button>
    <button on:click={() => close()}>キャンセル</button>
  </svelte:fragment>
</Dialog>

