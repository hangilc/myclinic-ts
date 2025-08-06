<script lang="ts">
  import type {
    薬品コード種別,
    情報区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";
  import Rep from "./drug-kind/Rep.svelte";
  import Form from "./drug-kind/Form.svelte";

  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let isEditing薬品コード: boolean;
  export let 薬品名称: string;
  export let 単位名: string | undefined;
  export let at: string;

  let ippanmei = "";
  let ippanmeicode = "";
  let formFocus: (() => boolean) | undefined = undefined;

  export const focus: () => void = () => {
    // if (formFocus) {
    //   formFocus();
    // }
  };

  if (薬品コード === "") {
    isEditing薬品コード = true;
  }

  initIppanmei();

  async function initIppanmei() {
    if (情報区分 === "医薬品" && 薬品コード) {
      if (薬品コード種別 === "一般名コード") {
        ippanmei = 薬品名称;
        ippanmeicode = 薬品コード;
      } else if (薬品コード種別 === "レセプト電算処理システム用コード") {
        const iyakuhincode = parseInt(薬品コード);
        let m = await api.getIyakuhinMaster(iyakuhincode, at);
        if (
          薬品コード種別 === "レセプト電算処理システム用コード" &&
          m.iyakuhincode.toString() === 薬品コード
        ) {
          ippanmei = m.ippanmei ?? "";
          ippanmeicode = m.ippanmeicode ?? "";
        }
      }
    } else {
      ippanmei = "";
      ippanmeicode = "";
    }
  }

  function doIppanmei() {
    if (ippanmei && ippanmeicode) {
      薬品コード種別 = "一般名コード";
      薬品コード = ippanmeicode;
      薬品名称 = ippanmei;
    }
  }

  function doEdit() {
    isEditing薬品コード = true;
  }

  function doCancel() {
    isEditing薬品コード = false;
  }

  function doSelect() {
    isEditing薬品コード = false;
  }
</script>

{#if isEditing薬品コード}
  <Form
    bind:薬品コード
    bind:薬品名称
    bind:単位名
    bind:ippanmei
    bind:ippanmeicode
    {情報区分}
    {薬品コード種別}
    {at}
    notifyCancel={doCancel}
    notifySelect={doSelect}
    bind:focus={formFocus}
  />
{:else}
  <Rep
    {薬品コード種別}
    {薬品名称}
    {ippanmei}
    onClick={doEdit}
    onIppanmeiClick={doIppanmei}
  />
{/if}
