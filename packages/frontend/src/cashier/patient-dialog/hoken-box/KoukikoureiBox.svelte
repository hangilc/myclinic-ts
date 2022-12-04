<script lang="ts">
  import type { Koukikourei } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";

  export let koukikourei: Koukikourei;
  export let usageCount: number;
  export let onEdit: (h: Koukikourei) => void;

  function formatValidFrom(sqldate: string): string {
    return kanjidate.format(kanjidate.f2, sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if (sqldate === "0000-00-00") {
      return "（期限なし）";
    } else {
      return kanjidate.format(kanjidate.f2, sqldate);
    }
  }
</script>

{#if koukikourei}
<div>
  {Hoken.koukikoureiRep(koukikourei)}
  【保険者番号】{koukikourei.hokenshaBangou}
  【被保険者番号】{koukikourei.hihokenshaBangou}
  【負担割】{toZenkaku(koukikourei.futanWari.toString())}割
  【期限開始】{formatValidFrom(koukikourei.validFrom)}
  【期限終了】{formatValidUpto(koukikourei.validUpto)}]
  【使用回数】{usageCount}回
  <button on:click={() => onEdit(koukikourei)}>編集</button>
</div>
{/if}
