
import { ReceiptDrawerData } from "@/lib/drawer/receipt-drawer-data";
import MishuuDialog from "./MishuuDialog.svelte";
// import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";
import api from "@/lib/api";

export function doMishuu(): void {
  const d: MishuuDialog = new MishuuDialog({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
    },
  });
}

export async function doBlankReceipt() {
  // let receipt = new ReceiptDrawerData();
  // let ops = await api.drawReceipt(receipt);
  // const dlog: DrawerDialog2 = new DrawerDialog2({
  //   target: document.body,
  //   props: {
  //     destroy: () => dlog.$destroy(),
  //     title: "領収書印刷",
  //     width: 148,
  //     height: 105,
  //     previewScale: 3,
  //     kind: "receipt",
  //     ops,
  //   },
  // });
}

