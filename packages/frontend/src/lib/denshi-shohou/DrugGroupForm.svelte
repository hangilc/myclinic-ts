<script lang="ts">
  import {
    freeStyleUsageCode,
    type 剤形区分,
    type 情報区分,
  } from "./denshi-shohou";
  import type { DrugKind } from "./drug-group-form/drug-group-form-types";
  import EditChouzaiSuuryouForm from "./drug-group-form/ChouzaiSuuryouForm.svelte";
  import EditUsageForm from "./drug-group-form/UsageForm.svelte";
  import ZaikeiKubunForm from "./drug-group-form/ZaikeiKubunForm.svelte";
  import type {
    RP剤情報,
    薬品情報,
    薬品レコード,
    剤形レコード,
    用法レコード,
    用法補足レコード,
    不均等レコード,
    負担区分レコード,
    薬品補足レコード,
  } from "./presc-info";
  import UsageAdditionForm from "./drug-group-form/UsageAdditionForm.svelte";
  import JohoKubunForm from "./drug-group-form/JohoKubunForm.svelte";
  import DrugKindForm from "./drug-group-form/DrugKindForm.svelte";
  import AmountForm from "./drug-group-form/AmountForm.svelte";
  import UnevenForm from "./drug-group-form/UnevenForm.svelte";
  import KouhiForm from "./drug-group-form/KouhiForm.svelte";
  import DrugAdditionForm from "./drug-group-form/DrugAdditionForm.svelte";
  import type { DrugGroupFormInit } from "./drug-group-form-types";
  import { toHankaku } from "../zenkaku";

  export let at: string;
  export let kouhiCount: number;
  export let init: DrugGroupFormInit;
  export let onEnter: (rec: RP剤情報) => void;
  let 剤形区分: 剤形区分 = init.剤形区分 ?? "内服";
  let 調剤数量: number | undefined = init.調剤数量;
  let 用法レコード: 用法レコード | undefined = init.用法レコード;
  let 用法補足レコード: 用法補足レコード[] | undefined = init.用法補足レコード;
  let 情報区分: 情報区分 = init.薬品レコード?.情報区分 ?? "医薬品";
  let drugKind: DrugKind | undefined = drugKindFromInit();
  let amount: number | undefined = amountFromInit();
  let 不均等レコード: 不均等レコード | undefined = init.不均等レコード;
  let 負担区分レコード: 負担区分レコード | undefined = init.負担区分レコード;
  let 薬品補足レコード: 薬品補足レコード[] | undefined = init.薬品補足レコード;

  let edit剤形区分 = false;
  let edit調剤数量 = false;
  let edit用法レコード = false;
  let edit用法補足レコード = false;
  let edit情報区分 = false;
  let edit薬剤種別 = false;
  let edit用量 = false;
  let edit不均等レコード = false;
  let edit負担区分レコード = false;
  let edit薬品補足レコード = false;

  function drugKindFromInit(): DrugKind | undefined {
    if (init?.薬品レコード) {
      const rec = init.薬品レコード;
      if (rec.薬品コード種別 && rec.薬品コード && rec.薬品名称 && rec.単位名) {
        return {
          薬品コード種別: rec.薬品コード種別,
          薬品コード: rec.薬品コード,
          薬品名称: rec.薬品名称,
          単位名: rec.単位名,
        };
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  function amountFromInit(): number | undefined {
    if (init?.薬品レコード?.分量) {
      const n = parseFloat(toHankaku(init.薬品レコード?.分量));
      return isNaN(n) ? undefined : n;
    } else if (init?.amount !== undefined) {
      return init.amount;
    } else {
      return undefined;
    }
  }

  function doEnter() {
    if (!(剤形区分 === "内服" || 剤形区分 === "頓服")) {
      調剤数量 = 1;
    }
    if (調剤数量 == undefined) {
      alert("調剤数量が設定されていません。");
      return;
    } else if (!(調剤数量 > 0)) {
      alert("調剤数量の値が正の数値でありません。");
      return;
    }
    if (用法レコード == undefined) {
      alert("用法が設定されていません。");
      return;
    }
    if (!drugKind) {
      alert("薬剤種別が設定されていません。");
      return;
    }
    if (amount == undefined) {
      alert("用量が設定されていません。");
      return;
    }
    const 剤形レコード: 剤形レコード = {
      剤形区分,
      調剤数量,
    };
    const 薬品レコード: 薬品レコード = {
      情報区分,
      薬品コード種別: drugKind.薬品コード種別,
      薬品コード: drugKind.薬品コード,
      薬品名称: drugKind.薬品名称,
      分量: amount.toString(),
      力価フラグ: "薬価単位",
      単位名: drugKind.単位名,
    };
    const 薬品情報: 薬品情報 = {
      薬品レコード,
      不均等レコード,
    };
    if (用法補足レコード && 用法補足レコード.length === 0) {
      用法補足レコード = undefined;
    }
    const rp: RP剤情報 = {
      剤形レコード,
      用法レコード,
      用法補足レコード,
      薬品情報グループ: [薬品情報],
    };
    onEnter(rp);
  }

  function timesRep(kubun: 剤形区分): string {
    switch (kubun) {
      case "内服":
        return "日分";
      case "頓服":
        return "回分";
      default:
        return "";
    }
  }

  function unevenRep(rec: 不均等レコード | undefined): string {
    if (rec) {
      const parts: string[] = [rec.不均等１回目服用量, rec.不均等２回目服用量];
      if (rec.不均等３回目服用量 != undefined) {
        parts.push(rec.不均等３回目服用量);
      }
      if (rec.不均等４回目服用量 != undefined) {
        parts.push(rec.不均等４回目服用量);
      }
      if (rec.不均等５回目服用量 != undefined) {
        parts.push(rec.不均等５回目服用量);
      }
      return parts.join("-");
    } else {
      return "";
    }
  }

  function kouhiRep(rec: 負担区分レコード | undefined): string {
    if (rec) {
      let parts: string[] = [];
      if (rec.第一公費負担区分) {
        parts.push("第一公費対象");
      }
      if (rec.第二公費負担区分) {
        parts.push("第二公費対象");
      }
      if (rec.第三公費負担区分) {
        parts.push("第三公費対象");
      }
      if (rec.特殊公費負担区分) {
        parts.push("特殊公費対象");
      }
      return parts.join("・");
    } else {
      return "";
    }
  }

  function onDone剤形区分(value: 剤形区分) {
    剤形区分 = value;
    edit剤形区分 = false;
  }

  function onDone調剤数量(value: number) {
    調剤数量 = value;
    edit調剤数量 = false;
  }

  function onDone用法(value: 用法レコード) {
    用法レコード = value;
    edit用法レコード = false;
  }

  function onDone用法補足レコード(value: 用法補足レコード[] | undefined) {
    用法補足レコード = value;
    edit用法補足レコード = false;
  }

  function onDone情報区分(value: 情報区分) {
    情報区分 = value;
    edit情報区分 = false;
  }

  function onDone薬剤種別(value: DrugKind) {
    drugKind = value;
    edit薬剤種別 = false;
  }

  function onDone用量(value: number) {
    amount = value;
    edit用量 = false;
  }

  function onDone不均等レコード(value: 不均等レコード | undefined) {
    不均等レコード = value;
    edit不均等レコード = false;
  }

  function onDone負担区分レコード(value: 負担区分レコード | undefined) {
    負担区分レコード = value;
    edit負担区分レコード = false;
  }

  function onDone薬品補足レコード(value: 薬品補足レコード[] | undefined) {
    薬品補足レコード = value;
    edit薬品補足レコード = false;
  }

  let edit = "";
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div>
    <div>
      <ZaikeiKubunForm {剤形区分} onChange={onDone剤形区分} />
    </div>
  </div>
  <!--  ------------------------------------------------------------>
  <hr />
  <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;">
    <div class="title" on:click={() => (edit情報区分 = !edit情報区分)}>
      情報区分
    </div>
    <div>
      {#if !edit情報区分}
        {情報区分}
      {:else}
        <JohoKubunForm {情報区分} onDone={onDone情報区分} />
      {/if}
    </div>
    <div class="title" on:click={() => (edit薬剤種別 = !edit薬剤種別)}>
      薬剤種別
    </div>
    <div>
      {#if !edit薬剤種別}
        {drugKind ? drugKind.薬品名称 : ""}
      {:else}<DrugKindForm
          {drugKind}
          {at}
          onDone={onDone薬剤種別}
          searchText={init.iyakuhinSearchText ?? ""}
        />
      {/if}
    </div>
    <div class="title" on:click={() => (edit用量 = !edit用量)}>用量</div>
    <div>
      {#if !edit用量}
        {amount ?? ""} {drugKind?.単位名 ?? ""}
      {:else}
        <AmountForm
          {amount}
          unit={drugKind?.単位名 ?? ""}
          onDone={onDone用量}
        />
      {/if}
    </div>
    <div
      class="title"
      on:click={() => (edit薬品補足レコード = !edit薬品補足レコード)}
    >
      薬品補足
    </div>
    <div>
      {#if !edit薬品補足レコード}
        <ul style="margin-top:0;margin-bottom:0">
          {#each 薬品補足レコード ?? [] as rec}
            <li>{rec.薬品補足情報}</li>
          {/each}
        </ul>
      {:else}<DrugAdditionForm
          {薬品補足レコード}
          onDone={onDone薬品補足レコード}
        />
      {/if}
    </div>
    <div class="title" on:click={() => (edit用法レコード = !edit用法レコード)}>
      用法
    </div>
    <div>
      {#if !edit用法レコード}
        {#if 用法レコード}
          {用法レコード.用法名称}
          {#if 用法レコード.用法コード === freeStyleUsageCode}
            <span
              style="font-size:12px;color:green;border:1px solid green;border-radius:3px;padding:2px 4px;"
              >free</span
            >
          {/if}
        {/if}
      {:else}<EditUsageForm 用法={用法レコード} onDone={onDone用法} />{/if}
    </div>
    {#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
      <div class="title" on:click={() => (edit調剤数量 = !edit調剤数量)}>
        調剤数量
      </div>
      <div>
        {#if !edit調剤数量}
          {調剤数量 ?? ""} {timesRep(剤形区分)}
        {:else}<EditChouzaiSuuryouForm
            {調剤数量}
            unit={timesRep(剤形区分)}
            onDone={onDone調剤数量}
          />{/if}
      </div>
    {/if}
    <div
      class="title"
      on:click={() => (edit用法補足レコード = !edit用法補足レコード)}
    >
      用法補足
    </div>
    <div>
      {#if !edit用法補足レコード}
        {#if 用法補足レコード}
          <ul style="margin-top:0;margin-bottom:0;">
            {#each 用法補足レコード as hosoku}
              <li>{hosoku.用法補足区分}：{hosoku.用法補足情報}</li>
            {/each}
          </ul>
        {/if}
      {:else}<UsageAdditionForm
          {用法補足レコード}
          onDone={onDone用法補足レコード}
        />
      {/if}
    </div>
    <div
      class="title"
      on:click={() => (edit不均等レコード = !edit不均等レコード)}
    >
      不均等
    </div>
    <div>
      {#if !edit不均等レコード}
        {unevenRep(不均等レコード)}
      {:else}<UnevenForm {不均等レコード} onDone={onDone不均等レコード} />{/if}
    </div>
    {#if kouhiCount > 0}
      <div
        class="title"
        on:click={() => (edit負担区分レコード = !edit負担区分レコード)}
      >
        公費
      </div>
      <div>
        {#if !edit負担区分レコード}
          {kouhiRep(負担区分レコード)}
        {:else}<KouhiForm
            {負担区分レコード}
            {kouhiCount}
            onDone={onDone負担区分レコード}
          />{/if}
      </div>
    {/if}
  </div>
  <div style="margin-top:10px;padding:10px;text-align:right;">
    <button on:click={doEnter}>決定</button>
  </div>
</div>

<style>
  .title {
    user-select: none;
    cursor: pointer;
  }

  .edit-title {
    font-weight: bold;
    user-select: none;
  }
</style>
