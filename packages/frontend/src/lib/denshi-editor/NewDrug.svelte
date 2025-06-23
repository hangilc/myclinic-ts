<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type {
    薬品情報,
    薬品レコード,
    不均等レコード,
  } from "../denshi-shohou/presc-info";
  import { validateDrug } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";
  import DrugForm from "./DrugForm.svelte";
  import type { 薬品補足レコードIndexed } from "./denshi-editor-types";
  import type { Writable } from "svelte/store";
  import "./widgets/style.css";

  export let onEnter: (created: 薬品情報) => void;
  export let onDone: () => void;
  export let at: string;

  export let isEditing: Writable<boolean>;
  let 剤形区分: 剤形区分 = "内服";
  let 情報区分: 情報区分 = "医薬品";
  let 薬品コード種別: 薬品コード種別 = "レセプト電算処理システム用コード";
  let 薬品コード: string = "";
  let isEditing薬品コード = true;
  let 薬品名称: string = "";
  let 分量: string = "";
  let isEditing分量 = true;
  let 力価フラグ: 力価フラグ = "薬価単位";
  let 単位名: string = "";
  let 不均等レコード: 不均等レコード | undefined = undefined;
  let isEditing不均等レコード = false;
  let 薬品補足レコード: 薬品補足レコードIndexed[] = [];

  $: $isEditing =
    isEditing薬品コード ||
    isEditing分量 ||
    isEditing不均等レコード ||
    薬品補足レコード.some((r) => r.isEditing);

  function doEnter() {
    let record: 薬品レコード | string = validateDrug({
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    });
    if (typeof record === "string") {
      alert(record);
      return;
    }
    let data: 薬品情報 = {
      薬品レコード: record,
      不均等レコード,
    };
    onEnter(data);
    onDone();
  }

  function doCancel() {
    onDone();
  }
</script>

<div class="wrapper">
  <div class="title">新規薬剤</div>
  <DrugForm
    {at}
    bind:剤形区分
    bind:情報区分
    bind:薬品コード種別
    bind:薬品コード
    bind:isEditing薬品コード
    bind:薬品名称
    bind:分量
    bind:isEditing分量
    bind:単位名
    bind:不均等レコード
    bind:isEditing不均等レコード
    bind:薬品補足レコード
  />
  <div class="commands">
    {#if !$isEditing}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={doCancel}>キャンセル</button>
  </div>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
