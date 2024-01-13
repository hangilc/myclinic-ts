<script lang="ts">
  import type { Kouhi } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";

  export let kouhi: Kouhi;
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
</script>

{Hoken.kouhiRep(kouhi)}
  (P-{kouhi.kouhiId})
【負担者】{kouhi.futansha}
【受給者】{kouhi.jukyuusha}
【期限開始】{formatValidFrom(kouhi.validFrom)}
【期限終了】{formatValidUpto(kouhi.validUpto)}] 【使用回数】{usageCount}回
