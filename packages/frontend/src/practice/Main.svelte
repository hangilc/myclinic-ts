<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  import { currentPatient } from "./exam/exam-vars";
  import JihiKenshin from "./jihi-kenshin/JihiKenshin.svelte";
  import RcptCheck from "./RcptCheck.svelte";
  import Rezept from "./Rezept.svelte";
  import Henrei from "./Henrei.svelte";
  import Cashier from "@/cashier/Cashier.svelte";
  import BigChar from "./BigChar.svelte";
  import FaxShohousen from "./fax-shohousen/FaxShohousen.svelte";
  import HoumonKango from "./houmon-kango/HoumonKango.svelte";
  import Shujii from "./shujii/Shujii.svelte";
  import RyouyouKeikakusho from "./ryouyou-keikakusho/RyouyouKeikakusho.svelte";
  import PrintSetting from "./print-setting/PrintSetting.svelte";
  import Scan from "@/practice/scan/Scan.svelte";
  import Refer from "./refer/Refer.svelte";
  import Shindansho from "./shindansho/Shindansho.svelte";
  import { createPrescInfo } from "@/lib/denshi-shohou/presc-info";

  export let serviceStore: Writable<string>;

  currentPatient.subscribe((p) => {
    if (p == null) {
      document.title = "診察";
    } else {
      document.title = `(${p.patientId}) ${p.fullName("")}`;
    }
  });

  function devShohou() {
    console.log(
      createPrescInfo({
        医療機関コード種別: "医科",
        医療機関コード: "1234567",
        医療機関都道府県コード: "東京",
        医療機関名称: "仮想医院",
        医療機関郵便番号: "123-4567",
        医療機関所在地: "東京都某所",
        医療機関電話番号: "03-1234-5678",
        ＦＡＸ番号: "03-1234-7777",
        その他連絡先: "user@example.com",
        診療科レコード: {
          診療科コード種別: "診療科コード",
          診療科コード: "内科",
        },
        医師漢字氏名: "診療　太郎",
        患者コード: "1234",
        患者漢字氏名: "診療　花子", // 性と名は全角スペースで区切る。
        患者カナ氏名: "ｼﾝﾘｮｳ ﾊﾅｺ", // 半角カナで記録する。姓と名は半角スペースで区切る。
        患者性別: "女",
        患者生年月日: "19600712",
        保険一部負担金区分: "高齢者一般",
        保険種別: "後期高齢者",
        保険者番号: "01234567",
        被保険者証記号: "記号",
        被保険者証番号: "123456",
        被保険者被扶養者: "被保険者",
        被保険者証枝番: "01",
        負担割合: 2, // 通常必要なし
        職務上の事由: "職務上",
        第一公費レコード: {
          公費負担者番号: "12345678",
          公費受給者番号: "33333333",
        },
        第二公費レコード: {
          公費負担者番号: "22345678",
          公費受給者番号: "44444444",
        },
        第三公費レコード: {
          公費負担者番号: "32345678",
          公費受給者番号: "55555555",
        },
        特殊公費レコード: {
          公費負担者番号: "42345678",
          公費受給者番号: "66666666",
        },
        レセプト種別コード: "1111",
      })
    );
  }

  // resolve保険種別
// レセプト種別レコード(レセプト種別コード: string)

</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  {#if $serviceStore === "cashier"}
    <Cashier isAdmin={true} />
  {/if}
  {#if $serviceStore === "fax-shohousen"}<FaxShohousen />{/if}
  <HoumonKango isVisible={$serviceStore === "houmon-kango"} />
  <RyouyouKeikakusho isVisible={$serviceStore === "ryouyou-keikakusho"} />
  <Shujii isVisible={$serviceStore === "shujii"} />
  {#if $serviceStore === "print-setting"}
    <PrintSetting />
  {/if}
  {#if $serviceStore === "scan"}
    <Scan />
  {/if}
  <Refer isVisible={$serviceStore === "refer"} />
  {#if $serviceStore === "shindansho"}
    <Shindansho />
  {/if}
  {#if $serviceStore === "phone"}
    <Phone />
  {/if}
  <JihiKenshin isVisible={$serviceStore === "jihi-kenshin"} />
  <RcptCheck isVisible={$serviceStore === "rcpt-check"} />
  <Rezept isVisible={$serviceStore === "rezept"} />
  <Henrei isVisible={$serviceStore === "henrei"} />
  <BigChar isVisible={$serviceStore === "big-char"} />

  <div>
    <button on:click={devShohou}>処方</button>
  </div>
</div>
