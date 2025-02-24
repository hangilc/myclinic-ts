<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import type { PrescInfoData } from "../presc-info";
  import GroupsDisp from "./GroupsDisp.svelte";

  export let shohou: PrescInfoData;
  export let prescriptionId: number | undefined;
  export let prolog: string = initProlog(shohou);

  function initProlog(shohou: PrescInfoData): string {
    return `院外処方（電子${prescriptionId ? "登録" : ""}）`
  }
</script>

<div>
  <div>{prolog}</div>
  <div>Ｒｐ）</div>
  <GroupsDisp groups={shohou.RP剤情報グループ} />
  {#each shohou.備考レコード ?? [] as rec}
    <div>備考：{rec.備考}</div>
  {/each}
  {#if shohou.使用期限年月日}
    <div>
      使用期限：{DateWrapper.fromOnshiDate(shohou.使用期限年月日).render(
        (d) =>
          `${d.getYear()}年${d.getMonth()}月${d.getDay()}日（${d.getYoubi()}）`
      )}
    </div>
  {/if}
  {#each shohou.提供情報レコード?.提供診療情報レコード ?? [] as rec}
    <div>
      診療情報：{#if rec.薬品名称}（{rec.薬品名称}）{/if}{rec.コメント}
    </div>
  {/each}
  {#each shohou.提供情報レコード?.検査値データ等レコード ?? [] as rec}
    <div>検査値等：{rec.検査値データ等}</div>
  {/each}
</div>
