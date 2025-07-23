<script lang="ts">
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import type { Text, Visit } from "myclinic-model";
  import { drugRep } from "../../helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { toZenkaku } from "@/lib/zenkaku";

  export let text: Text;
  export let visit: Visit;

  const data: PrescInfoData =
    TextMemoWrapper.fromText(text).probeShohouMemo()!.shohou;
</script>

<div class="top">
  <div>電子処方</div>
  <div>Ｒｐ）</div>
  {#each data.RP剤情報グループ as group}
    <div class="drugs">
      {#each group.薬品情報グループ as drug, index}
        <div>{toZenkaku((index + 1).toString())}）</div>
        <div>{drugRep(drug)}</div>
      {/each}
    </div>
    <div>
      {group.用法レコード.用法名称}
      {daysTimesDisp(group)}
    </div>
  {/each}
</div>

<style>
  .top {
    font-size: 14px;
  }

  .drugs {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
