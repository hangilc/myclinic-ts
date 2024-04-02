<script lang="ts">
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { drawHoumonKango } from "@/lib/drawer/forms/houmon-kango/houmon-kango-drawer";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import type { Patient } from "myclinic-model";

  export let isVisible: boolean;
  let patient: Patient | undefined = undefined;
  let startDate: Date | null = null;
  let uptoDate: Date | null = null;
  let issueDate: Date = new Date();

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: (selected: Patient) => {
          patient = selected;
        },
      },
    });
  }

  function doCreate() {
    const ops = drawHoumonKango({
      タイトル: "介護予防訪問看護・訪問看護指示書",
      サブタイトル: "訪問看護指示期間",
      validFrom: "2024-10-01",
      validUpto: "2024-12-31",
      患者氏名: "診療太郎",
      birthdate: "1943-07-12",
      患者住所: "〒177-01 東京都",
      主たる傷病名: "高血圧、高脂血症",
      病状: "血圧とＬＤＬコレステロールはほぼ正常範囲内にコントロールされている。",
      薬剤: "アムロジピン５ｍｇ、アトルバスタチン１０ｍｇ",
      netakiri: "J2",
      ninchi: "Ｉ",
      youkaigo: "要支援1",
      jukusou: "D3",
      酸素療法: "1",
      酸素療法流速: "3",
      吸引器: "1",
      留置カテーテル: "1",
      留置カテーテルサイズ: "12F",
      留置カテーテル交換日: "3",
      経管栄養: "1",
      経管栄養経鼻: "1",
      経管栄養チューブサイズ: "14F",
      経管栄養交換日: "7",
      人工呼吸器: "1",
      人工呼吸器陽圧式: "1",
      人工呼吸器設定: "マニュアル",
      気管カニューレ: "1",
      気管カニューレサイズ: "12F",
      人工肛門: "1",
      装置その他マーク: "1",
      装置その他: "経過観察中",
      留意事項: "血圧上昇時にはリハビリテーションを中止する。",
      "留意事項：リハビリテーション": "週１回、１回２時間、屋外歩行",
      点滴指示: "現在は中止",
      緊急時の連絡先: "当院",
      不在時の対応法: "他院",
      特記すべき留意事項: "特になし",
      "他の訪問看護ステーションへの指示：有": "1",
      "他の訪問看護ステーションへの指示：ステーション名": "某ステーション",
      "たんの吸引等実施のための訪問介護事業所への指示：有": "1",
      "たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名":
        "某事業所",
      "発行日（元号）": "令和",
      "発行日（年）": "6",
      "発行日（月）": "4",
      "発行日（日）": "2",
      医療機関名: "某内科クリニック",
      "医療機関（住所）": "〒123-4567 東京",
      "医療機関（電話）": "03-1234-5678",
      "医療機関（ＦＡＸ）": "03-4321-8765",
      医師氏名: "診療太郎",
      "提出先（訪問看護ステーション）": "某看護ステーション",
    });

    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        ops,
        destroy: () => d.$destroy(),
        width: 210 * 1.5,
        height: 297 * 1.5,
        viewBox: "0 0 210 297",
        scale: 1.5,
      },
    });
  }
</script>

{#if isVisible}
  <div class="title">訪問看護</div>
  <div>
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button>患者終了</button>
    {/if}
  </div>
  {#if patient || true}
    <!-- <div>
      患者：{patient.lastName} {patient.firstName}
    </div> -->
    <div>
      開始日：<EditableDate bind:date={startDate} />
      終了日：<EditableDate bind:date={uptoDate} />
    </div>
    <div>
      発行日：<EditableDate bind:date={issueDate} />
    </div>
    <button on:click={doCreate}>作成</button>
  {/if}
{/if}

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
</style>
