<script lang="ts">
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import DenshiHenkanDialog from "../regular/DenshiHenkanDialog.svelte";
  import type { Kouhi } from "myclinic-model";

  export let shohou: PrescInfoData;
  export let at: string;
  export let kouhiList: Kouhi[];
  export let onCancel: () => void;
  export let onModified: (newShohou: PrescInfoData) => void;

  function doEdit() {
    const d: DenshiHenkanDialog = new DenshiHenkanDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        init: { kind: "denshi", data: shohou },
        at,
        kouhiList,
        title: "処方編集",
        onEnter: (newShohou: PrescInfoData) => {
          onModified(newShohou);
        },
        onCancel: () => { onCancel()}
      }
    })
  }

  function doPrint() {
    
  }
</script>
  <div style="border:1px solid green;padding:10px;border-radius:6px">
    <DenshiShohouDisp {shohou} prescriptionId={undefined}/>
  </div>
  <div style="margin-top:6px;">
    <a href="javascript:void(0)" on:click={doEdit}>編集</a>
    <a href="javascript:void(0)" on:click={doPrint}>印刷</a>
    <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
  </div>