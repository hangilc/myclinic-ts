<script lang="ts">
  import { Shahokokuho } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  

  export let shahokokuho: Shahokokuho;
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

(S-{shahokokuho.shahokokuhoId}) 【保険者番号】<span data-cy="hokensha-bangou"
  >{shahokokuho.hokenshaBangou}</span
>
【被保険者記号】<span data-cy="hihokensha-kigou"
  >{shahokokuho.hihokenshaKigou}</span
>
【被保険者番号】<span data-cy="hihokensha-bangou"
  >{shahokokuho.hihokenshaBangou}</span
>
【枝番】<span data-cy="edaban">{shahokokuho.edaban}</span>
【本人・家族】<span data-cy="honnin">{shahokokuho.honnninKazokuType.rep}</span>
【期限開始】<span data-cy="valid-from"
  >{formatValidFrom(shahokokuho.validFrom)}</span
>
【期限終了】<span data-cy="valid-upto"
  >{formatValidUpto(shahokokuho.validUpto)}</span
>
