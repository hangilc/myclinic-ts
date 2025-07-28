<script lang="ts">
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { drugRep } from "../../helper";

  export let group: RP剤情報;
  export let selectedName: string | undefined;

  function rep(drug: 薬品情報): string {
    let html = drugRep(drug);
    if (selectedName) {
      return html.replaceAll(
        selectedName,
        `<span style="color: red">${selectedName}</span>`,
      );
    } else {
      return html;
    }
  }


</script>

<div class="drugs">
  {#each group.薬品情報グループ as drug}
    <div>{@html rep(drug)}</div>
  {/each}
</div>
<div>
  {group.用法レコード.用法名称}
  {daysTimesDisp(group)}
</div>
