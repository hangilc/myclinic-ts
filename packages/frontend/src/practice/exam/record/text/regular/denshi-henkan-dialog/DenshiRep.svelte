<script lang="ts">
  import type {
    RP剤情報,
    不均等レコード,
    用法補足レコード,
    薬品補足レコード,
    負担区分レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import { toZenkaku } from "myclinic-rezept/zenkaku";

  export let denshi: RP剤情報;
  let info = denshi.薬品情報グループ[0];
  let rec = info.薬品レコード;

  function unevenRep(data: 不均等レコード): string {
    const ps: string[] = [];
    ps.push(data.不均等１回目服用量);
    ps.push(data.不均等２回目服用量);
    if (data.不均等３回目服用量) {
      ps.push(data.不均等３回目服用量);
    }
    if (data.不均等４回目服用量) {
      ps.push(data.不均等４回目服用量);
    }
    if (data.不均等５回目服用量) {
      ps.push(data.不均等５回目服用量);
    }
    return toZenkaku(`(${ps.join("-")})`);
  }

  function drugAdditionalsRep(data: 薬品補足レコード[]): string {
    return data.map(d => d.薬品補足情報).join("、") + "。";

  }

  function usageAdditionalsRep(data: 用法補足レコード[]): string {
    return data.map(d => d.用法補足情報).join("、") +"。";
  }

  function futanKubunRep(data: 負担区分レコード): string {
    const ts: string[] = [];
    if( data.第一公費負担区分 !== undefined ){
      ts.push("第一公費対象");
    }
    if( data.第二公費負担区分 !== undefined ){
      ts.push("第二公費対象");
    }
    if( data.第三公費負担区分 !== undefined ){
      ts.push("第三公費対象");
    }
    if( data.特殊公費負担区分 !== undefined ){
      ts.push("特殊公費対象");
    }
    return ts.join("、") + "。";
  }
</script>

<div>
  {rec.薬品名称}
  {toZenkaku(rec.分量)}{rec.単位名}
  {#if info.不均等レコード}{unevenRep(info.不均等レコード)}{/if}
  {#if info.薬品補足レコード}{drugAdditionalsRep(info.薬品補足レコード)}
  {/if}
</div>
<div>
  {denshi.用法レコード.用法名称}
  {#if denshi.用法補足レコード}
    {usageAdditionalsRep(denshi.用法補足レコード)}
  {/if}
</div>
{#if denshi.剤形レコード.剤形区分 === "内服"}
  <div>{toZenkaku(denshi.剤形レコード.調剤数量.toString())}日分</div>
{:else if denshi.剤形レコード.剤形区分 === "頓服"}
  <div>{toZenkaku(denshi.剤形レコード.調剤数量.toString())}回分</div>
{/if}
{#if info.負担区分レコード}
<div>
  {futanKubunRep(info.負担区分レコード)}
</div>
{/if}
