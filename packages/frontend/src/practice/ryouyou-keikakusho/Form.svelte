<script lang="ts">
  import type { RyouyouKeikakushoData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";

  export let ryouyouKeikakushoData: RyouyouKeikakushoData;
</script>

<div class="data-input">
  <span>issue-year</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["issue-year"]}
  />
</div>
<div class="data-input">
  <span>issue-month</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["issue-month"]}
  />
</div>
<div class="data-input">
  <span>issue-day</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["issue-day"]}
  />
</div>
<div class="data-input">
  <span>issue-times</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["issue-times"]}
  />
</div>
<div class="data-input">
  <span>patient-name</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["patient-name"]}
  />
</div>
<div class="data-input">
  <span>patient-sex-male</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["patient-sex-male"]}
  />
</div>
<div class="data-input">
  <span>patient-sex-female</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["patient-sex-female"]}
  />
</div>
<div class="data-input">
  <span>birthdate-gengou-meiji</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-gengou-meiji"]}
  />
</div>
<div class="data-input">
  <span>birthdate-gengou-taishou</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-gengou-taishou"]}
  />
</div>
<div class="data-input">
  <span>birthdate-gengou-shouwa</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-gengou-shouwa"]}
  />
</div>
<div class="data-input">
  <span>birthdate-gengou-heisei</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-gengou-heisei"]}
  />
</div>
<div class="data-input">
  <span>birthdate-gengou-reiwa</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-gengou-reiwa"]}
  />
</div>
<div class="data-input">
  <span>birthdate-nen</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-nen"]}
  />
</div>
<div class="data-input">
  <span>birthdate-month</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-month"]}
  />
</div>
<div class="data-input">
  <span>birthdate-day</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-day"]}
  />
</div>
<div class="data-input">
  <span>patient-age</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["patient-age"]}
  />
</div>
<div class="data-input">
  <span>disease-diabetes</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["disease-diabetes"]}
  />
</div>
<div class="data-input">
  <span>disease-hypertension</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["disease-hypertension"]}
  />
</div>
<div class="data-input">
  <span>disease-hyperlipidemia</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["disease-hyperlipidemia"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-体重-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-体重-mark"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-体重</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-体重"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-BMI-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-BMI-mark"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-BMI</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-BMI"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-BP-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-BP-mark"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-BP</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-BP"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-HbA1c-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-HbA1c-mark"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-HbA1c</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-HbA1c"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-達成目標</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-達成目標"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-行動目標</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-行動目標"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-摂取量を適正にする-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-摂取量を適正にする-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-食塩・調味料を控える-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-食塩・調味料を控える-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-食物繊維の摂取を増やす-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData[
      "juuten-食事-食物繊維の摂取を増やす-mark"
    ]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-外食の際の注意事項-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-外食の際の注意事項-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-外食の際の注意事項</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-外食の際の注意事項"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-油を使った料理の摂取を減らす-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData[
      "juuten-食事-油を使った料理の摂取を減らす-mark"
    ]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-その他-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-その他-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-節酒-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-節酒-mark"]}
  />
</div>
<div class="data-input">
  <span>shokuji-食事-節酒</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["shokuji-食事-節酒"]}
  />
</div>
<div class="data-input">
  <span>shokuji-食事-節酒-回</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["shokuji-食事-節酒-回"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-間食-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-間食-mark"]}
  />
</div>
<div class="data-input">
  <span>shokuji-食事-間食</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["shokuji-食事-間食"]}
  />
</div>
<div class="data-input">
  <span>shokuji-食事-間食-回</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["shokuji-食事-間食-回"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-食べ方-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-食べ方-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-食べ方</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-食べ方"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-食事時間-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-食事時間-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-種類-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-種類-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-種類</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-種類"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-時間</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-時間"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-頻度</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-頻度"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-強度-脈拍</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-強度-脈拍"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-強度-その他</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-強度-その他"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-活動量-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-活動量-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-活動量</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-活動量"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-注意事項-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-注意事項-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-注意事項</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-注意事項"]}
  />
</div>
<div class="data-input">
  <span>juuten-たばこ-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-たばこ-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-たばこ-非喫煙者-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-たばこ-非喫煙者-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-たばこ-禁煙・節煙の有効性-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-たばこ-禁煙・節煙の有効性-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-たばこ-禁煙の実施補法等-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-たばこ-禁煙の実施補法等-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-shokuji-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-shokuji-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-仕事</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-仕事"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-余暇</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-余暇"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-睡眠の確保</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-睡眠の確保"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-減量</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-減量"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-家庭での計測</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-家庭での計測"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-その他-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-その他-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-その他-その他</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-その他-その他"]}
  />
</div>
<div class="data-input">
  <span>kensa-採血日-月</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-採血日-月"]}
  />
</div>
<div class="data-input">
  <span>kensa-採血日-日</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-採血日-日"]}
  />
</div>
<div class="data-input">
  <span>kensa-総コレステロール-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-総コレステロール-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-総コレステロール</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-総コレステロール"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-空腹時-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-空腹時-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-随時-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-随時-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-食後-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-食後-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-食後</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-食後"]}
  />
</div>
<div class="data-input">
  <span>kensa-中性脂肪-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-中性脂肪-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-中性脂肪</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-中性脂肪"]}
  />
</div>
<div class="data-input">
  <span>kensa-血糖-値</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血糖-値"]}
  />
</div>
<div class="data-input">
  <span>kensa-ＨＤＬコレステロール-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-ＨＤＬコレステロール-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-ＨＤＬコレステロール</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-ＨＤＬコレステロール"]}
  />
</div>
<div class="data-input">
  <span>kensa-HbA1c</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-HbA1c"]}
  />
</div>
<div class="data-input">
  <span>kensa-ＬＤＬコレステロール-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-ＬＤＬコレステロール-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-ＬＤＬコレステロール</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-ＬＤＬコレステロール"]}
  />
</div>
<div class="data-input">
  <span>kensa-血液検査項目-その他-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血液検査項目-その他-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-血液検査項目-その他</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-血液検査項目-その他"]}
  />
</div>
<div class="data-input">
  <span>kensa-栄養状態-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-栄養状態-mark"]}
  />
</div>
<div class="data-input">
  <span>kensa-その他-その他-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["kensa-その他-その他-mark"]}
  />
</div>
<div class="data-input">
  <span>医師氏名</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["医師氏名"]}
  />
</div>
<div class="data-input">
  <span>birthdate-age</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["birthdate-age"]}
  />
</div>
<div class="data-input">
  <span>mokuhyou-目標達成状況</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["mokuhyou-目標達成状況"]}
  />
</div>
<div class="data-input">
  <span>juuten-食事-指導の必要なし-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-食事-指導の必要なし-mark"]}
  />
</div>
<div class="data-input">
  <span>juuten-運動-指導の必要なし-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["juuten-運動-指導の必要なし-mark"]}
  />
</div>
<div class="data-input">
  <span>患者署名省略-mark</span><input
    type="text"
    bind:value={ryouyouKeikakushoData["患者署名省略-mark"]}
  />
</div>

<style>
  .data-input {
    margin: 4px 0;
  }

  .data-input span + input {
    margin-left: 4px;
  }
</style>