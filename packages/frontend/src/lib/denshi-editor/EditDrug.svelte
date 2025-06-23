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
    薬品補足レコード,
  } from "../denshi-shohou/presc-info";
  import { validateDrug } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";
  import DrugForm from "./DrugForm.svelte";
  import {
    index薬品補足レコード,
    unindex薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "./denshi-editor-types";

  export let drug: 薬品情報;
  export let 剤形区分: 剤形区分;
  export let onEnter: (created: 薬品情報) => void;
  export let onDelete: () => void;
  export let onDone: () => void;
  export let at: string;

  let 情報区分: 情報区分 = drug.薬品レコード.情報区分;
  let 薬品コード種別: 薬品コード種別 = drug.薬品レコード.薬品コード種別;
  let 薬品コード: string = drug.薬品レコード.薬品コード;
  let isEditing薬品コード: boolean = false;
  let 薬品名称: string = drug.薬品レコード.薬品名称;
  let 分量: string = drug.薬品レコード.分量;
  let isEditing分量: boolean = false;
  let 力価フラグ: 力価フラグ = drug.薬品レコード.力価フラグ;
  let 単位名: string = drug.薬品レコード.単位名;
  let 不均等レコード = drug.不均等レコード;
  let isEditing不均等レコード: boolean = false;
  let 薬品補足レコード: 薬品補足レコードIndexed[] = (
    drug.薬品補足レコード ?? []
  ).map((r) => index薬品補足レコード(r));

  function isEditing薬品補足レコード(): boolean {
    if (薬品補足レコード) {
      for (let r of 薬品補足レコード) {
        if (r.isEditing) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  function get薬品補足レコード(): 薬品補足レコード[] | undefined {
    if (薬品補足レコード) {
      let rs = 薬品補足レコード.map((r) => unindex薬品補足レコード(r));
      return rs.length === 0 ? undefined : rs;
    } else {
      return undefined;
    }
  }

  function confirmNotEditing(): boolean {
    if (isEditing薬品コード) {
      alert("薬品が編集中です。");
      return false;
    }
    if (isEditing分量) {
      alert("分量が編集中です。");
      return false;
    }
    if (isEditing不均等レコード) {
      alert("不均等が編集中です。");
      return false;
    }
    if (isEditing薬品補足レコード()) {
      alert("薬品補足が編集中です。");
      return false;
    }
    return true;
  }

  function doEnter() {
    if (!confirmNotEditing()) {
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
    let err = validateDrug(record);
    if (typeof err === "string") {
      alert(err);
      return;
    }
    let data: 薬品情報 = {
      薬品レコード: record,
      不均等レコード,
      薬品補足レコード: get薬品補足レコード(),
    };
    onEnter(data);
    onDone();
  }

  function doCancel() {
    onDone();
  }

  function doDelete() {
    if (confirm("この薬剤を削除していいですか？")) {
      onDelete();
      onDone();
    }
  }
</script>

<div class="wrapper">
  <div class="title">薬剤編集</div>
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
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
