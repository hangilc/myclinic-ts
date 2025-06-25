<script lang="ts">
  import DrugForm from "./DrugForm.svelte";
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type {
    薬品情報,
    薬品レコード,
    RP剤情報,
    剤形レコード,
    用法レコード,
    不均等レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import DrugUsage from "./DrugUsage.svelte";
  import { toHankaku } from "@/lib/zenkaku";
  import DrugDays from "./DrugDays.svelte";
  import {
    index薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "./denshi-editor-types";
  import type { Writable } from "svelte/store";
  import Link from "./widgets/Link.svelte";
  import "./widgets/style.css";
  import { onMount } from "svelte";

  export let onDone: () => void;
  export let at: string;
  export let onEnter: (group: RP剤情報) => void;
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
  let 用法コード: string = "";
  let isEditing用法コード = true;
  let 用法名称: string = "";
  let 調剤数量: number = 5;
  let isEditing調剤数量 = true;
  let 不均等レコード: 不均等レコード | undefined = undefined;
  let isEditing不均等レコード = false;
  let 薬品補足レコード: 薬品補足レコードIndexed[] = [];

  $: $isEditing =
    isEditing薬品コード ||
    isEditing分量 ||
    isEditing用法コード ||
    isEditing調剤数量 ||
    isEditing不均等レコード ||
    薬品補足レコード.some((r) => r.isEditing);

  let focusDrugForm: (() => void) | undefined = undefined;

  onMount(() => {
    if( focusDrugForm ){
      focusDrugForm();
    }
  });

  function doCancel() {
    onDone();
  }

  function doEnter() {
    if ($isEditing) {
      return;
    }

    let record: 薬品レコード = {
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    };
    let 薬品情報: 薬品情報 = {
      薬品レコード: record,
      不均等レコード,
    };
    let 用法レコード: 用法レコード = {
      用法コード,
      用法名称,
    };
    if (剤形区分 === "内服" || 剤形区分 === "頓服") {
      // nop
    } else {
      調剤数量 = 1;
    }
    let 剤形レコード: 剤形レコード = {
      剤形区分,
      調剤数量,
    };
    let group: RP剤情報 = {
      剤形レコード,
      用法レコード,
      薬品情報グループ: [薬品情報],
    };
    onEnter(group);
    onDone();
  }

  function doUneven() {
    不均等レコード = {
      不均等１回目服用量: "2",
      不均等２回目服用量: "1",
    };
    isEditing不均等レコード = true;
  }

  function addYakuhinHosoku() {
    if (!薬品補足レコード) {
      薬品補足レコード = [];
    }
    薬品補足レコード.push(index薬品補足レコード({ 薬品補足情報: "" }));
    薬品補足レコード = 薬品補足レコード;
  }

  function addGroupHosoku() {}

  function on剤形区分Change(kubun: 剤形区分) {
    if( kubun === "内服" || kubun === "頓服" ){
      調剤数量 = 7;
      isEditing調剤数量 = true;
    } else {
      調剤数量 = 1;
      isEditing調剤数量 = false;
    }
  }
</script>

<div class="wrapper">
  <div class="title">新規薬剤グループ</div>
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
    on剤形区分Change={on剤形区分Change}
    bind:focus={focusDrugForm}
  />
  <div class="form-part">
    <DrugUsage
      bind:用法コード
      bind:用法名称
      bind:isEditing={isEditing用法コード}
    />
  </div>
  {#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
    <DrugDays bind:剤形区分 bind:調剤数量 bind:isEditing={isEditing調剤数量} />
  {/if}

  <div class="link-commands">
    <Link onClick={addYakuhinHosoku}>薬品補足追加</Link>
    {#if !不均等レコード}<Link onClick={doUneven}>不均等</Link>{/if}
    <Link onClick={addGroupHosoku}>グループ補足追加</Link>
  </div>
  <div class="commands">
    {#if !$isEditing}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={doCancel}>キャンセル</button>
  </div>
</div>

<style>
  .form-part {
    margin: 10px 0;
  }
</style>
