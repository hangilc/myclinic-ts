<script lang="ts">
  import {
    drawRyouyouhiDouisho,
    mkRyouyouhiDouishoDrawerData,
    type RyouyouhiDouishoDrawerData,
  } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import AddressField from "@/lib/drawer/forms/ryouyouhi-douisho/components/AddressField.svelte";
  import TextField from "@/lib/drawer/forms/ryouyouhi-douisho/components/TextField.svelte";

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

  <div class="fields-container">
    <TextField bind:value={data["patient-address"]} label="住所" />
    <TextField bind:value={data["patient-name"]} label="氏名" />
    <TextField bind:value={data["birth-date"]} label="生年月日" />
    <TextField bind:value={data["condition-name"]} label="傷病名" />
    <TextField bind:value={data["onset-date"]} label="発病年月日" />
    <TextField bind:value={data["consent-type"]} label="同意区分" />
    <TextField bind:value={data["examination-date"]} label="診察日" />
    <TextField bind:value={data["issue-date"]} label="発行日" />
    <TextField bind:value={data["clinic-name"]} label="保険医療機関名" />
    <TextField bind:value={data["clinic-address"]} label="所在地" />
    <TextField bind:value={data["doctor-name"]} label="保険医氏名" />
  </div>
{/if}
fd
<style>
  .fields-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>
