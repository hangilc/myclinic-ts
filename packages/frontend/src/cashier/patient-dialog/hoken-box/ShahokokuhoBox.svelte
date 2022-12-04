<script lang="ts">
  import type { Shahokokuho } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";

  export let shahokokuho: Shahokokuho;
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

<div>
  {Hoken.shahokokuhoRep(shahokokuho)}
  【保険者番号】{shahokokuho.hokenshaBangou}
  【被保険者記号】{shahokokuho.hihokenshaKigou}
  【被保険者番号】{shahokokuho.hihokenshaBangou}
  【枝番】{shahokokuho.edaban}
  【本人・家族】{shahokokuho.honnninKazokuType.rep}
  【期限開始】{formatValidFrom(shahokokuho.validFrom)}
  【期限終了】{formatValidUpto(shahokokuho.validUpto)}]
  【使用回数】{usageCount}回
</div>
