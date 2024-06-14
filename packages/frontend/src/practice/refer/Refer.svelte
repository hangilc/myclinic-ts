<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRefer } from "@/lib/drawer/forms/refer/refer-drawer";
  import type { ReferDrawerData } from "@/lib/drawer/forms/refer/refer-drawer-data";

  export let isVisible = false;
  let title = "紹介状";
  let referHospital = "";
  let referDoctor = "";
  let patientName = "";
  let patientInfo = "";
  let diagnosis = "";
  let content = "";
  let issueDate = "";
  let address = "";
  let clinicName = "";
  let issuerDoctorName = "";

  let dataExample: ReferDrawerData = {
    title: "紹介状",
    "refer-hospital": "東京警察病院",
    "refer-doctor": "麻酔科、松本一郎　先生御机下",
    "patient-name": "患者：診療太郎",
    "patient-info": "昭和30年7月21日生、80才、男性",
    diagnosis: "診断：糖尿病",
    content: `いつも大変お世話になっております。
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
高血圧症、高脂血症にて当院に通院されている方ですが、
よろしくお願いいたします。`,
    "issue-date": "令和6年6月9日",
    address:
      "〒123-4567\n東京都杉並区荻窪1-1-1\n電話 03-1234-5678\nＦＡＸ 03-1234-5555",
    "clinic-name": "東京内科クリニック",
    "issuer-doctor-name": "診療次郎",
  };

  function doView() {
    let data = {
      title,
      "refer-hospital": referHospital,
      "refer-doctor": referDoctor,
      "patient-name": patientName,
      "patient-info": patientInfo,
      diagnosis,
      content,
      "issue-date": issueDate,
      address,
      "clinic-name": clinicName,
      "issuer-doctor-name": issuerDoctorName,
    };

    let pages = drawRefer(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        pages,
        kind: "refer",
        destroy: () => d.$destroy(),
        scale: 2,
      },
    });
  }
</script>

{#if isVisible}
  <ServiceHeader title="紹介状" />
  <div style="display:grid; grid-template-columns:auto 1fr;gap: 4px;">
    <span>表題：</span>
    <input type="text" bind:value={title} style="width: 6em;" />
    <span>医療機関</span>
    <input type="text" bind:value={referHospital} style="width: 16em;" />
    <span>医師</span>
    <input type="text" bind:value={referDoctor} style="width: 16em;" />
    <span>患者氏名</span>
    <input type="text" bind:value={patientName} style="width: 16em;" />
    <span>患者情報</span>
    <input type="text" bind:value={patientInfo} style="width: 16em;" />
    <span>診断</span>
    <input type="text" bind:value={diagnosis} style="width: 16em;" />
    <span>内容</span>
    <input type="text" bind:value={content} style="width: 16em;" />
    <span>発行日</span>
    <input type="text" bind:value={issueDate} style="width: 16em;" />
    <span>住所</span>
    <input type="text" bind:value={address} style="width: 16em;" />
    <span>発行機関</span>
    <input type="text" bind:value={clinicName} style="width: 16em;" />
    <span>発行医師</span>
    <input type="text" bind:value={issuerDoctorName} style="width: 16em;" />
    </div>
  <button on:click={doView}>表示</button>
{/if}
