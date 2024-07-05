<script lang="ts">
  import { getClinicInfo } from "../cache";
  import Dialog from "../Dialog.svelte";
  import { castTo都道府県コード, tryCastTo都道府県コード, type 都道府県コード } from "./denshi-shohou";
  import {
    createPrescInfo,
    type PrescInfoData,
    type RP剤情報,
    type 薬品情報,
  } from "./presc-info";
  import ShohouForm from "./ShohouForm.svelte";

  export let destroy: () => void;
  export let prescRecords: 薬品情報[] = [];
  export let at: string;

  let records: { id: number; presc: 薬品情報 }[] = prescRecords.map(
    (r, id) => ({
      id,
      presc: r,
    })
  );

  function doCancel() {
    destroy();
  }

  async function doNew(drug: RP剤情報) {
    const clinicInfo = await getClinicInfo();
    const postalCode = clinicInfo.postalCode.replace(/^〒/, "");
    let shohou: PrescInfoData = {
      医療機関コード種別: "医科",
      医療機関コード: clinicInfo.kikancode,
      医療機関都道府県コード: castTo都道府県コード(clinicInfo.todoufukencode),
      医療機関名称: clinicInfo.name,
      医療機関郵便番号: postalCode,
      医療機関所在地: clinicInfo.address,
      医療機関電話番号: clinicInfo.tel,
      ＦＡＸ番号: clinicInfo.fax,
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
      処方箋交付年月日: "20240703",
      使用期限年月日: "20240710",
      備考レコード: [
        {
          備考: "一包化",
        },
        {
          備考: "その他",
        },
      ],
      RP剤情報グループ: [drug],
      提供情報レコード: {
        提供診療情報レコード: [
          {
            薬品名称: "アポカリプス",
            コメント: "新しく加えました。",
          },
          {
            コメント: "薬追加しています。",
          },
        ],
        検査値データ等レコード: [{ 検査値データ等: "血清クレアチニン値:0.87" }],
      },
    };
    const info = createPrescInfo(shohou);
    console.log(info);
  }
</script>

<Dialog title="処方入力" {destroy}>
  <div class="top">
    <div>
      {#each records as record (record.id)}{/each}
    </div>
    <div class="new-entry">
      <ShohouForm {at} let:enter onEnter={doNew}>
        <button on:click={enter}>Enter</button>
      </ShohouForm>
    </div>
    <div class="commands">
      <button on:click={doCancel}>キャンセル</button>
    </div>
  </div>
</Dialog>

<style>
  .top {
    width: 360px;
  }
  .new-entry {
    margin: 10px 0;
  }
  .commands {
    text-align: right;
    margin-top: 10px;
  }
</style>
