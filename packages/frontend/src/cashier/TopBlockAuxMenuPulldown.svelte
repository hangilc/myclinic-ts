<script lang="ts">
  import { ReceiptDrawerData } from "@/lib/drawer/receipt-drawer-data";
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import MishuuDialog from "./MishuuDialog.svelte";
  import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";
  import api from "@/lib/api";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;

  function doMishuu(): void {
    destroy();
    const d: MishuuDialog = new MishuuDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }

  async function doBlankReceipt() {
    let receipt = new ReceiptDrawerData();
    let ops = await api.drawReceipt(receipt);
    destroy();
    const dlog: DrawerDialog2 = new DrawerDialog2({
      target: document.body,
      props: {
        destroy: () => dlog.$destroy(),
        title: "領収書印刷",
        width: 148,
        height: 105,
        previewScale: 3,
        kind: "receipt",
        ops,
      }
    });
  }
</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doMishuu}>未収処理</a>
  <a href="javascript:void(0)" on:click={doBlankReceipt}>手書き領収書印刷</a>
</SurfacePulldown>

<style>
  a {
    margin: 4px 0;
    display: block;
  }
</style>
