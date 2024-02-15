
import { ReceiptDrawerData } from "@/lib/drawer/forms/receipt/receipt-drawer-data";
import MishuuDialog from "./MishuuDialog.svelte";
import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
import { drawReceipt } from "@/lib/drawer/forms/receipt/receipt-drawer";
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
  let receipt = new ReceiptDrawerData();
  const clinicInfo = await api.getClinicInfo();
  receipt.clinicName = clinicInfo.name;
  receipt.addressLines = [
    clinicInfo.postalCode,
    clinicInfo.address,
    clinicInfo.tel,
    clinicInfo.fax,
    clinicInfo.homepage
  ];
  const ops = drawReceipt(receipt);
  const dlog: DrawerDialog = new DrawerDialog({
    target: document.body,
    props: {
      destroy: () => dlog.$destroy(),
      title: "領収書印刷",
      width: 148,
      height: 105,
      scale: 3,
      kind: "receipt",
      ops,
    },
  });
}

