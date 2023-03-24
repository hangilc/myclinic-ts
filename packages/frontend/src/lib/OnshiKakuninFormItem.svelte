<script lang="ts">
  import type { ResultOfQualificationConfirmation } from "onshi-result/dist/ResultOfQualificationConfirmation";
  import { convertHankakuKatakanaToZenkakuHiraKana } from "./zenkaku";
  import * as kanjidate from "kanjidate";

  export let result: ResultOfQualificationConfirmation;

  function onshiDateRep(onshiDate: string): string {
    return kanjidate.format(kanjidate.f2, onshiDate);
  }

  function onshiDateTimeRep(onshiDateTime: string): string {
    return kanjidate.format("{G}{N}年{M}月{D}日 {h}時{m}分{s}秒", onshiDateTime);
  }
</script>

<div class="wrapper">
  <span>氏名</span>
  <span>{result.name.replace("　", " ")}</span>
  <span>よみ</span>
  <span>{convertHankakuKatakanaToZenkakuHiraKana(result.nameKana ?? "")}</span>
  <span>保険者証種類</span>
  <span>{result.insuredCardClassification}</span>
  <span>保険者番号</span>
  <span>{result.insurerNumber}</span>
  <span>保険者</span>
  <span>{result.insurerName}</span>
  {#if result.insuredCardSymbol}
    <span>被保険者記号</span>
    <span>{result.insuredCardSymbol}</span>
  {/if}
  <span>被保険者番号</span>
  <span>{result.insuredIdentificationNumber}</span>
  {#if result.insuredBranchNumber}
    <span>枝番</span>
    <span>{result.insuredBranchNumber}</span>
  {/if}
  <span>生年月日</span>
  <span>{onshiDateRep(result.birthdate)}</span>
  {#if result.personalFamilyClassification}
    <span>本人・家族</span>
    <span>{result.personalFamilyClassification}</span>
  {/if}
  {#if result.InsuredName}
    <span>世帯主</span>
    <span>{result.InsuredName}</span>
  {/if}
  {#if result.nameOfOther}
    <span>別名</span>
    <span>{result.nameOfOther}</span>
  {/if}
  {#if result.nameOfOtherKana}
    <span>別名よみ</span>
    <span>{result.nameOfOtherKana}</span>
  {/if}
  {#if result.sex1}
    <span>性別</span>
    <span>{result.sex1}</span>
  {/if}
  {#if result.sex2}
    <span>性別２</span>
    <span>{result.sex2}</span>
  {/if}
  {#if result.postNumber}
    <span>郵便番号</span>
    <span>{result.postNumber}</span>
  {/if}
  {#if result.address}
    <span>住所</span>
    <span>{result.address}</span>
  {/if}
  {#if result.insuredCertificateIssuanceDate}
    <span>交付日</span>
    <span>{onshiDateRep(result.insuredCertificateIssuanceDate)}</span>
  {/if}
  {#if result.insuredCardValidDate}
    <span>期限開始</span>
    <span>{onshiDateRep(result.insuredCardValidDate)}</span>
  {/if}
  {#if result.insuredCardExpirationDate}
    <span>期限終了</span>
    <span>{onshiDateRep(result.insuredCardExpirationDate)}</span>
  {/if}
  {#if result.koukikoureiFutanWari}
    <span>後期高齢</span>
    <span>{result.koukikoureiFutanWari}割</span>
  {/if}
  {#if result.preschoolClassification}
    <span>未就学</span>
    <span>{result.preschoolClassification}</span>
  {/if}
  {#if result.reasonOfLoss}
    <span>資格喪失事由</span>
    <span>{result.reasonOfLoss}</span>
  {/if}
  {#if result.elderlyRecipientCertificateInfo}
    {@const kourei = result.elderlyRecipientCertificateInfo}
    {#if kourei.elderlyRecipientCertificateDate}
      <span>高齢交付日</span>
      <span>{onshiDateRep(kourei.elderlyRecipientCertificateDate)}</span>
    {/if}
    {#if kourei.elderlyRecipientValidStartDate}
      <span>高齢開始</span>
      <span>{onshiDateRep(kourei.elderlyRecipientValidStartDate)}</span>
    {/if}
    {#if kourei.elderlyRecipientValidEndDate}
      <span>高齢終了</span>
      <span>{onshiDateRep(kourei.elderlyRecipientValidEndDate)}</span>
    {/if}
    {#if kourei.futanWari != undefined}
      <span>高齢負担割</span>
      <span>{kourei.futanWari}割</span>
    {/if}
  {/if}
  <span>限度額同意</span>
  <span>{result.limitApplicationCertificateRelatedConsFlg}</span>
  {#if result.limitApplicationCertificateRelatedConsTime}
    <span>限度額同意時</span>
    <span>{onshiDateTimeRep(result.limitApplicationCertificateRelatedConsTime)}</span>
  {/if}
  {#if result.gendogaku}
  {@const gendo = result.gendogaku}
    {#if gendo.limitApplicationCertificateClassification}
      <span>限度額種類</span>
      <span>{gendo.limitApplicationCertificateClassification}</span>
    {/if}
    {#if gendo.limitApplicationCertificateClassificationFlag}
      <span>限度額分類</span>
      <span>{gendo.limitApplicationCertificateClassificationFlag}</span>
    {/if}
    {#if gendo.limitApplicationCertificateDate}
      <span>限度額交付</span>
      <span>{onshiDateRep(gendo.limitApplicationCertificateDate)}</span>
    {/if}
    {#if gendo.limitApplicationCertificateValidStartDate}
      <span>限度額開始</span>
      <span>{onshiDateRep(gendo.limitApplicationCertificateValidStartDate)}</span>
    {/if}
    {#if gendo.limitApplicationCertificateValidEndDate}
      <span>限度額終了</span>
      <span>{onshiDateRep(gendo.limitApplicationCertificateValidEndDate)}</span>
    {/if}
    {#if gendo.limitApplicationCertificateLongTermDate}
      <span>限度額長期</span>
      <span>{gendo.limitApplicationCertificateLongTermDate}</span>
    {/if}
  {/if}
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .wrapper > *:nth-child(odd) {
    margin-right: 10px;
  }
</style>
