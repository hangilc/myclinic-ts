
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
  { // test
    receipt.patientName = "田中隆";
    receipt.charge = 1200;
    receipt.visitDate = "2024-02-15";
    receipt.issueDate = "2024-02-16";
    receipt.patientId = "1234";
    receipt.hoken = "国保";
    receipt.futanWari = "3";
    receipt.shoshin = "170";
    receipt.kanri = "180";
    receipt.zaitaku = "190";
    receipt.kensa = "200";
    receipt.gazou = "210";
    receipt.touyaku = "220";
    receipt.chuusha = "230";
    receipt.shochi = "240";
    receipt.sonota = "250";
    receipt.souten = "260";
    receipt.hokengai = ["保険外１", "保険外２", "保険外３", "保険外４"]
  }
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

