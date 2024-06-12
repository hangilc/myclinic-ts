<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRefer } from "@/lib/drawer/forms/refer/refer-drawer";
  import type { ReferDrawerData } from "@/lib/drawer/forms/refer/refer-drawer-data";

  export let isVisible = false;

  let data: ReferDrawerData = {
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
    address: "〒123-4567\n東京都杉並区荻窪1-1-1\n電話 03-1234-5678\nＦＡＸ 03-1234-5555",
    "clinic-name": "東京内科クリニック",
    "issuer-doctor-name": "診療次郎",
  };

  let pages = drawRefer(data);
</script>

{#if isVisible}
  <ServiceHeader title="紹介状" />
  <DrawerSvg
    {ops}
    width={`${210 * 2}px`}
    height={`${297 * 2}px`}
    viewBox="0 0 210 297"
  />
{/if}
