<script lang="ts">
  import {
    drawRyouyouhiDouisho,
    mkRyouyouhiDouishoDrawerData,
    type RyouyouhiDouishoDrawerData,
  } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";

  export let isVisible: boolean;
  let data: RyouyouhiDouishoDrawerData = mkRyouyouhiDouishoDrawerData();

  setupDummyData(data);

  function setupDummyData(data: RyouyouhiDouishoDrawerData) {
    data["patient-address"] = "東京都新宿区西新宿1-2-3";
    data["patient-name"] = "山田太郎";
    data["birth-date"] = "昭和35年4月15日";
    data["condition-name"] = "腰痛症";
    data["onset-date"] = "令和6年1月10日";
    data["consent-type"] = "初回の同意";
    data["examination-date"] = "令和7年1月14日";
    data["issue-date"] = "令和7年1月14日";
    data["clinic-name"] = "東京個人医院";
    data["clinic-address"] = "東京都新宿区西新宿2-3-4";
    data["doctor-name"] = "医師 田中一郎";
  }

  function doPrint() {
    let ops = drawRyouyouhiDouisho(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        scale: 2,
      },
    });
  }
</script>

{#if isVisible}
  <button on:click={doPrint}>印刷</button>
{/if}
