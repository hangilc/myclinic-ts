<script lang="ts">
  import api from "@/lib/api";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawShujii } from "@/lib/drawer/forms/shujii/shujii-drawer";

  export let isVisible: boolean = false;
  let dataMap: ShujiiDrawerData = {
    doctorName: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    fax: "",
    detail: "",
  };
  let ops: Op[] = drawShujii(dataMap);
  let refresh: () => void;

  loadClinicInfo();

  async function loadClinicInfo() {
    const clinicInfo = await api.getClinicInfo();
    dataMap.doctorName = clinicInfo.doctorName;
    dataMap.clinicName = clinicInfo.name;
    dataMap.clinicAddress = clinicInfo.address;
    dataMap.phone = clinicInfo.tel;
    dataMap.fax = clinicInfo.fax;
    ops = drawShujii(dataMap);
    refresh();

  }
</script>

{#if isVisible}
  <div class="title">主治医意見書</div>
  <div class="data-input">
    <span>doctorName</span><input
      type="text"
      bind:value={dataMap["doctorName"]}
    />
    <span>clinicName</span><input
      type="text"
      bind:value={dataMap["clinicName"]}
    />
    <span>clinicAddress</span><input
      type="text"
      bind:value={dataMap["clinicAddress"]}
    />
    <span>phone</span><input type="text" bind:value={dataMap["phone"]} />
    <span>fax</span><input type="text" bind:value={dataMap["fax"]} />
    <span>detail</span><input type="text" bind:value={dataMap["detail"]} />
  </div>
{/if}

<DrawerSvg
  {ops}
  width="210px"
  height="297px"
  viewBox="0 0 210 297"
  displayWidth={`${210 * 1.5}px`}
  displayHeight={`${297 * 1.5}px`}
/>

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .data-input > span {
    display: block;
  }
</style>
