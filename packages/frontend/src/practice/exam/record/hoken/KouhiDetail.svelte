<script lang="ts">
  import type { Kouhi } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  

  export let kouhi: Kouhi;

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

  (P-{kouhi.kouhiId})
【負担者】{kouhi.futansha}
【受給者】{kouhi.jukyuusha}
【期限開始】{formatValidFrom(kouhi.validFrom)}
【期限終了】{formatValidUpto(kouhi.validUpto)}
