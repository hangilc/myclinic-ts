<script lang="ts">
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import { toZenkaku } from "myclinic-rezept/zenkaku";

  export let denshi: RP剤情報;
  let info = denshi.薬品情報グループ[0];
  let rec = info.薬品レコード;

  console.log("DenshiRep", denshi.薬品情報グループ[0]);
</script>

<div>{rec.薬品名称}</div>
<div>{toZenkaku(rec.分量)}{rec.単位名}</div>
<div>{denshi.用法レコード.用法名称}</div>
{#if denshi.剤形レコード.剤形区分 === "内服"}
  <div>{toZenkaku(denshi.剤形レコード.調剤数量.toString())}日分</div>
{:else if denshi.剤形レコード.剤形区分 === "頓服"}
  <div>{toZenkaku(denshi.剤形レコード.調剤数量.toString())}回分</div>
{/if}
