<script lang="ts">
  
  import { toZenkaku } from "@/lib/zenkaku";
  import { Koukikourei, dateToSqlDate } from "myclinic-model";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import { FormatDate } from "myclinic-util";

  export let koukikourei: Koukikourei;

  function formatValidFrom(sqldate: string): string {
    return FormatDate.f2(sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if (sqldate === "0000-00-00") {
      return "（期限なし）";
    } else {
      return FormatDate.f2(sqldate);
    }
  }

</script>

(K-{koukikourei.koukikoureiId}) 【保険者番号】{koukikourei.hokenshaBangou}
【被保険者番号】{koukikourei.hihokenshaBangou}
【負担割】{toZenkaku(koukikourei.futanWari.toString())}割 【期限開始】{formatValidFrom(
  koukikourei.validFrom
)}
【期限開始】<span data-cy="valid-from"
  >{formatValidFrom(koukikourei.validFrom)}</span
>
【期限終了】<span data-cy="valid-upto"
  >{formatValidUpto(koukikourei.validUpto)}</span
>
