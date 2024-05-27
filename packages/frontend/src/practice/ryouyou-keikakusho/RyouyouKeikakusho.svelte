<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import {
    type RyouyouKeikakushoKeizokuData,
    drawRyouyouKeikakushoKeizoku,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import type { RyouyouKeikakushoShokaiData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";

  export let isVisible = false;
  let mode: "shokai" | "keizoku" = "shokai";
  let ops: Op[] = [];
  $: if (isVisible && ops.length === 0) {
    doSwitchMode();
  }
  let shokaiDataMap = {
    "issue-year": "",
    "issue-month": "",
    "issue-day": "",
    "patient-name": "",
    "patient-sex-male": "",
    "patient-sex-female": "",
    "birthdate-gengou-meiji": "",
    "birthdate-gengou-taishou": "",
    "birthdate-gengou-shouwa": "",
    "birthdate-gengou-heisei": "",
    "birthdate-gengou-reiwa": "",
    "birthdate-nen": "",
    "birthdate-month": "",
    "birthdate-day": "",
    "disease-diabetes": "",
    "disease-hypertension": "",
    "disease-hyperlipidemia": "",
    "mokuhyou-体重-mark": false,
    "mokuhyou-体重": "",
    "mokuhyou-BMI-mark": false,
    "mokuhyou-BMI": "",
    "mokuhyou-BP-mark": false,
    "mokuhyou-bp": "",
    "mokuhyou-HbA1c-mark": false,
    "mokuhyou-BP": "",
    "mokuhyou-達成目標": "",
    "mokuhyou-行動目標": "",
    "juuten-食事-mark": false,
    "juuten-食事-摂取量を適正にする-mark": false,
    "juuten-食事-食塩・調味料を控える-mark": false,
    "juuten-食事-食物繊維の摂取を増やす-mark": false,
    "juuten-食事-外食の際の注意事項-mark": false,
    "juuten-食事-外食の際の注意事項": "",
    "juuten-食事-油を使った料理の摂取を減らす-mark": false,
    "juuten-食事-その他-mark": false,
    "juuten-食事-節酒-mark": false,
    "shokuji-食事-節酒": "",
    "shokuji-食事-節酒-回": "",
    "juuten-食事-間食-mark": false,
    "shokuji-食事-間食": "",
    "shokuji-食事-間食-回": "",
    "juuten-食事-食べ方-mark": false,
    "juuten-食事-食べ方": "",
    "juuten-食事-食事時間-mark": false,
    "juuten-運動-mark": false,
    "juuten-運動-種類-mark": false,
    "juuten-運動-種類": "",
    "juuten-運動-時間": "",
    "juuten-運動-頻度": "",
    "juuten-運動-強度-脈拍": "",
    "juuten-運動-強度-その他": "",
    "juuten-運動-活動量-mark": false,
    "juuten-運動-活動量": "",
    "juuten-運動-注意事項-mark": false,
    "juuten-運動-注意事項": "",
    "juuten-たばこ-mark": false,
    "juuten-たばこ-非喫煙者-mark": false,
    "juuten-たばこ-禁煙・節煙の有効性-mark": false,
    "juuten-たばこ-禁煙の実施補法等-mark": false,
    "juuten-shokuji-mark": false,
    "juuten-その他-仕事": "",
    "juuten-その他-余暇": "",
    "juuten-その他-睡眠の確保": "",
    "juuten-その他-減量": "",
    "juuten-その他-家庭での計測": "",
    "juuten-その他-その他-mark": false,
    "juuten-その他-その他": "",
    "kensa-採血日-月": "",
    "kensa-採血日-日": "",
    "kensa-総コレステロール-mark": false,
    "kensa-総コレステロール": "",
    "kensa-血糖-mark": false,
    "kensa-血糖-空腹時-mark": false,
    "kensa-血糖-随時-mark": false,
    "kensa-血糖-食後-mark": false,
    "kensa-血糖-食後": "",
    "kensa-中性脂肪-mark": false,
    "kensa-中性脂肪": "",
    "kensa-血糖-値": "",
    "kensa-ＨＤＬコレステロール-mark": false,
    "kensa-ＨＤＬコレステロール": "",
    "kensa-HbA1c": "",
    "kensa-ＬＤＬコレステロール-mark": false,
    "kensa-ＬＤＬコレステロール": "",
    "kensa-血液検査項目-その他-mark": false,
    "kensa-血液検査項目-その他": "",
    "kensa-栄養状態-mark": false,
    "kensa-その他-その他-mark": false,
    医師氏名: "",
  };

  function doSwitchMode() {
    console.log("doSwitchMode");
    if (mode === "shokai") {
      startShokai();
    } else if (mode === "keizoku") {
      startKeizoku();
    }
  }

  function startShokai() {
    const data: RyouyouKeikakushoShokaiData = {};
    ops = drawRyouyouKeikakushoShokai(data);
  }

  function startKeizoku() {
    const data: RyouyouKeikakushoKeizokuData = {};
    ops = drawRyouyouKeikakushoKeizoku(data);
  }
</script>

{#if isVisible}
  <div>
    <input
      type="radio"
      value="shokai"
      bind:group={mode}
      on:change={doSwitchMode}
    />
    初回
    <input
      type="radio"
      value="keizoku"
      bind:group={mode}
      on:change={doSwitchMode}
    /> 継続
  </div>
  <div class="form-inputs">
    {#if mode === "shokai"}
      <div class="drawer-input">
        <span>issue-year</span><input
          type="text"
          bind:value={shokaiDataMap["issue-year"]}
        />
      </div>
      <div class="drawer-input">
        <span>issue-month</span><input
          type="text"
          bind:value={shokaiDataMap["issue-month"]}
        />
      </div>
      <div class="drawer-input">
        <span>issue-day</span><input
          type="text"
          bind:value={shokaiDataMap["issue-day"]}
        />
      </div>
      <div class="drawer-input">
        <span>patient-name</span><input
          type="text"
          bind:value={shokaiDataMap["patient-name"]}
        />
      </div>
      <div class="drawer-input">
        <span>patient-sex-male</span><input
          type="text"
          bind:value={shokaiDataMap["patient-sex-male"]}
        />
      </div>
      <div class="drawer-input">
        <span>patient-sex-female</span><input
          type="text"
          bind:value={shokaiDataMap["patient-sex-female"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-gengou-meiji</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-gengou-meiji"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-gengou-taishou</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-gengou-taishou"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-gengou-shouwa</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-gengou-shouwa"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-gengou-heisei</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-gengou-heisei"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-gengou-reiwa</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-gengou-reiwa"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-nen</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-nen"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-month</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-month"]}
        />
      </div>
      <div class="drawer-input">
        <span>birthdate-day</span><input
          type="text"
          bind:value={shokaiDataMap["birthdate-day"]}
        />
      </div>
      <div class="drawer-input">
        <span>disease-diabetes</span><input
          type="text"
          bind:value={shokaiDataMap["disease-diabetes"]}
        />
      </div>
      <div class="drawer-input">
        <span>disease-hypertension</span><input
          type="text"
          bind:value={shokaiDataMap["disease-hypertension"]}
        />
      </div>
      <div class="drawer-input">
        <span>disease-hyperlipidemia</span><input
          type="text"
          bind:value={shokaiDataMap["disease-hyperlipidemia"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-体重-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["mokuhyou-体重-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-体重</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-体重"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-BMI-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["mokuhyou-BMI-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-BMI</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-BMI"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-BP-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["mokuhyou-BP-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-bp</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-bp"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-HbA1c-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["mokuhyou-HbA1c-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-BP</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-BP"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-達成目標</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-達成目標"]}
        />
      </div>
      <div class="drawer-input">
        <span>mokuhyou-行動目標</span><input
          type="text"
          bind:value={shokaiDataMap["mokuhyou-行動目標"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-摂取量を適正にする-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-摂取量を適正にする-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-食塩・調味料を控える-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-食塩・調味料を控える-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-食物繊維の摂取を増やす-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-食物繊維の摂取を増やす-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-外食の際の注意事項-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-外食の際の注意事項-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-外食の際の注意事項</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-食事-外食の際の注意事項"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-油を使った料理の摂取を減らす-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap[
            "juuten-食事-油を使った料理の摂取を減らす-mark"
          ]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-その他-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-その他-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-節酒-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-節酒-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>shokuji-食事-節酒</span><input
          type="text"
          bind:value={shokaiDataMap["shokuji-食事-節酒"]}
        />
      </div>
      <div class="drawer-input">
        <span>shokuji-食事-節酒-回</span><input
          type="text"
          bind:value={shokaiDataMap["shokuji-食事-節酒-回"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-間食-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-間食-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>shokuji-食事-間食</span><input
          type="text"
          bind:value={shokaiDataMap["shokuji-食事-間食"]}
        />
      </div>
      <div class="drawer-input">
        <span>shokuji-食事-間食-回</span><input
          type="text"
          bind:value={shokaiDataMap["shokuji-食事-間食-回"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-食べ方-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-食べ方-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-食べ方</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-食事-食べ方"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-食事-食事時間-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-食事-食事時間-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-運動-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-種類-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-運動-種類-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-種類</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-種類"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-時間</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-時間"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-頻度</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-頻度"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-強度-脈拍</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-強度-脈拍"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-強度-その他</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-強度-その他"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-活動量-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-運動-活動量-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-活動量</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-活動量"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-注意事項-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-運動-注意事項-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-運動-注意事項</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-運動-注意事項"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-たばこ-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-たばこ-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-たばこ-非喫煙者-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-たばこ-非喫煙者-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-たばこ-禁煙・節煙の有効性-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-たばこ-禁煙・節煙の有効性-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-たばこ-禁煙の実施補法等-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-たばこ-禁煙の実施補法等-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-shokuji-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-shokuji-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-仕事</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-仕事"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-余暇</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-余暇"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-睡眠の確保</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-睡眠の確保"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-減量</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-減量"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-家庭での計測</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-家庭での計測"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-その他-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["juuten-その他-その他-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>juuten-その他-その他</span><input
          type="text"
          bind:value={shokaiDataMap["juuten-その他-その他"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-採血日-月</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-採血日-月"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-採血日-日</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-採血日-日"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-総コレステロール-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-総コレステロール-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-総コレステロール</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-総コレステロール"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-血糖-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-空腹時-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-血糖-空腹時-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-随時-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-血糖-随時-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-食後-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-血糖-食後-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-食後</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-血糖-食後"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-中性脂肪-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-中性脂肪-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-中性脂肪</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-中性脂肪"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血糖-値</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-血糖-値"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-ＨＤＬコレステロール-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-ＨＤＬコレステロール-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-ＨＤＬコレステロール</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-ＨＤＬコレステロール"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-HbA1c</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-HbA1c"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-ＬＤＬコレステロール-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-ＬＤＬコレステロール-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-ＬＤＬコレステロール</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-ＬＤＬコレステロール"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血液検査項目-その他-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-血液検査項目-その他-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-血液検査項目-その他</span><input
          type="text"
          bind:value={shokaiDataMap["kensa-血液検査項目-その他"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-栄養状態-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-栄養状態-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>kensa-その他-その他-mark</span><input
          type="checkbox"
          bind:value={shokaiDataMap["kensa-その他-その他-mark"]}
        />
      </div>
      <div class="drawer-input">
        <span>医師氏名</span><input
          type="text"
          bind:value={shokaiDataMap["医師氏名"]}
        />
      </div>
    {:else if mode === "keizoku"}{/if}
  </div>
  <DrawerSvg
    bind:ops
    width={`${210 * 3}`}
    height={`${297 * 3}`}
    viewBox="0 0 210 297"
  />
{/if}

<style>
  .form-inputs {
    max-height: 300px;
    overflow: auto;
  }

  .form-inputs span + input {
    margin-left: 4px;
  }
</style>