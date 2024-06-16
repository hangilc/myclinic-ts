<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import {
    drawShindansho,
    type ShindanshoDrawerData,
  } from "@/lib/drawer/forms/shindansho/shindansho-drawer";
  import { A4 } from "@/lib/drawer/compiler/paper-size";

  let data: ShindanshoDrawerData = {
    "patient-name": "田中 一郎",
    "birth-date": "平成2年3月21日生",
    diagnosis: "高血圧症、高脂血症",
    text: "血圧は 130/80 にコントロールされている。ＬＤＬコレステロールは 128 にコントロールされている。",
    "issue-date": "令和2年8月7日",
    "postal-code": "〒123-4567",
    address: "東京都杉並区",
    phone: "Tel: 03-1234-5678",
    fax: "Fax: 03-4321-8765",
    "clinic-name": "内科診療所",
    "doctor-name": "診療太郎",
  };

  // public String patientName = "田中 一郎";
  // public String birthDate = "平成2年3月21日生";
  // public String diagnosis = "高血圧症、高脂血症";
  // public String text = "";
  // public String issueDate = "令和2年8月7日";
  // public String postalCode = "〒123-4567";
  // public String address = "東京都杉並区";
  // public String phone = "Tel: 03-1234-5678";
  // public String fax = "Fax: 03-4321-8765";
  // public String clinicName = "内科診療所";
  // public String doctorName = "診療太郎";

  let ops = drawShindansho(data);
</script>

<ServiceHeader title="診断書" />
<DrawerSvg
  {ops}
  viewBox="0 0 211 298"
  width={`${210 * 2}px`}
  height={`${297 * 2}px`}
/>
