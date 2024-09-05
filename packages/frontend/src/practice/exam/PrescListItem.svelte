<script lang="ts">
  import { prescStatus } from "@/lib/denshi-shohou/presc-api";
  import type { StatusResult } from "@/lib/denshi-shohou/shohou-interface";
  import * as cache from "@lib/cache";

  export let item: {
    PrescriptionId: string;
    AccessCode: string;
    CreateDateTime: string;
  };
  let showStatus = false;
  let status: StatusResult | undefined = undefined;

  async function doToggleShowStatus() {
    if( showStatus) {
      showStatus = false;
      status = undefined;
    } else {
      const kikancode = await cache.getShohouKikancode();
      status = await prescStatus(kikancode, item.PrescriptionId);
      
    }
  }
</script>

<div style="margin: 10px 0; border: 1px solid gray; border-radius: 4px; padding: 10px;">
  <div>処方ＩＤ：{item.PrescriptionId}</div>
  <div>引換番号：{item.AccessCode}</div>
  <div>発行時刻：{item.CreateDateTime}</div>
  <div>
    <a href="javascript:void(0)" on:click={doToggleShowStatus}>処理状況</a>
  </div>
</div>
