<script lang="ts">
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";
  import { Koukikourei, dateToSqlDate } from "myclinic-model";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";

  export let koukikourei: Koukikourei;
  export let usageCount: number;

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

  function doOnshiConfirm() {
    const confirmDate = (koukikourei.validUpto = "0000-00-00"
      ? dateToSqlDate(new Date())
      : koukikourei.validUpto);
    // const query = onshi_query_from_hoken(shahokokuho, birthdate, confirmDate);
    const d: OnshiKakuninDialog = new OnshiKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hoken: koukikourei,
        confirmDate,
      },
    });
  }
</script>

{Hoken.koukikoureiRep(koukikourei)}
【保険者番号】{koukikourei.hokenshaBangou}
【被保険者番号】{koukikourei.hihokenshaBangou}
【負担割】{toZenkaku(koukikourei.futanWari.toString())}割 【期限開始】{formatValidFrom(
  koukikourei.validFrom
)}
【期限終了】{formatValidUpto(koukikourei.validUpto)}] 【使用回数】{usageCount}回
<a href="javascript:;" on:click={doOnshiConfirm}>資格確認</a>
