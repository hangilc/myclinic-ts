<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type { 薬品情報, 薬品レコード } from "../denshi-shohou/presc-info";
  import { validateDrug } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";
  import DrugForm from "./DrugForm.svelte";

  export let onEnter: (created: 薬品情報) => void;
  export let onDone: () => void;
  export let at: string;

  let 剤形区分: 剤形区分 = "内服";
  let 情報区分: 情報区分 = "医薬品";
  let 薬品コード種別: 薬品コード種別 = "レセプト電算処理システム用コード";
  let 薬品コード: string = "";
  let 薬品名称: string = "";
  let 分量: string = "";
  let 力価フラグ: 力価フラグ = "薬価単位";
  let 単位名: string | undefined = undefined;

  function doEnter() {
    let record: 薬品レコード| string = validateDrug({
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
    };
    onEnter(data);
    onDone();
  }

  function doCancel() {
    onDone();
  }
</script>

<div>新規薬剤</div>
<DrugForm
  {at}
  bind:剤形区分
  bind:情報区分
  bind:薬品コード種別
  bind:薬品コード
  bind:薬品名称
  bind:分量
  bind:単位名
/>
<div class="commands">
  <button on:click={doEnter}>入力</button>
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
