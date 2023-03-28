<script lang="ts">
  import type { Roujin } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";

  export let roujin: Roujin;
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

{Hoken.roujinRep(roujin)}
【市町村】{roujin.shichouson}
【受給者】{roujin.jukyuusha}
【負担割】{toZenkaku(roujin.futanWari.toString())}割 【期限開始】{formatValidFrom(
  roujin.validFrom
)}
【期限終了】{formatValidUpto(roujin.validUpto)}] 【使用回数】{usageCount}回
