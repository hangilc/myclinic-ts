<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
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
    address:
      "〒123-4567\n東京都杉並区荻窪1-1-1\n電話 03-1234-5678\nＦＡＸ 03-1234-5555",
    "clinic-name": "東京内科クリニック",
    "issuer-doctor-name": "診療次郎",
  };

  let pages: { setup: Op[]; pageOps: Op[][] } = drawRefer(data);
  let ops: Op[] = [];
  let pageIndex = 0;
  gotoPage(0);

  {
    gotoPage(1);
    console.log("ops", JSON.stringify(ops, undefined, 2))
  }

  function gotoPage(index: number) {
    if( index >= 0 && index < pages.pageOps.length ){
      ops = [...pages.setup, ...pages.pageOps[index]];
      pageIndex = index;
    }
  }

  function doView() {
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        pages,
        kind: "refer",
        destroy: () => d.$destroy(),
        scale: 3,
      }
    })
  }
</script>

{#if isVisible}
  <ServiceHeader title="紹介状" />
  <button on:click={doView}>表示</button>
  {#if pages.pageOps.length > 1}
    <a href="javascript:void(0)" on:click={() => gotoPage(pageIndex - 1)}
      >&lt;</a
    >
    {pageIndex + 1} / {pages.pageOps.length}
    <a href="javascript:void(0)" on:click={() => gotoPage(pageIndex + 1)}
      >&gt;</a
    >
  {/if}
  <DrawerSvg
    {ops}
    width={`${210 * 2}px`}
    height={`${297 * 2}px`}
    viewBox="0 0 210 297"
  />
{/if}
