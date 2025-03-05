<script lang="ts">
  import {
    freeStyleUsageCode,
    type 剤形区分,
    type 情報区分,
  } from "./denshi-shohou";
  import type { DrugKind } from "./drug-group-form/drug-group-form-types";
  import EditChouzaiSuuryouForm from "./drug-group-form/ChouzaiSuuryouForm.svelte";
  import UsageForm from "./drug-group-form/UsageForm.svelte";
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
  import DrugKindForm from "./drug-group-form/DrugKindForm.svelte";
  import AmountForm from "./drug-group-form/AmountForm.svelte";
  import UnevenForm from "./drug-group-form/UnevenForm.svelte";
  import KouhiForm from "./drug-group-form/KouhiForm.svelte";
  import DrugAdditionForm from "./drug-group-form/DrugAdditionForm.svelte";
  import type { DrugGroupFormInit } from "./drug-group-form-types";
  import { toHankaku } from "../zenkaku";
  import CheckCircle from "@/icons/CheckCircle.svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import type { Kouhi } from "myclinic-model";
  import KizaiKindForm from "./drug-group-form/KizaiKindForm.svelte";
  import Trash from "@/icons/Trash.svelte";
  import { ippanmeiStateFromMaster, type IppanmeiState } from "./denshi-shohou-form/denshi-shohou-form-types";
  import api from "../api";

  export let at: string;
  export let kouhiList: Kouhi[];
  export let init: DrugGroupFormInit;
  export let onEnter: (
    rec: RP剤情報,
    ippanmeiState: IppanmeiState | undefined
  ) => void;
  export let onCancel: () => void;
  export let onDelete: (() => void) | undefined;
  let 剤形区分: 剤形区分 = init.剤形区分 ?? "内服";
  let 調剤数量Input: string = init.調剤数量?.toString() ?? "";
  let 用法レコード: 用法レコード | undefined = init.用法レコード;
  let 用法補足レコード: 用法補足レコード[] | undefined = init.用法補足レコード;
  let drugKind: DrugKind | undefined = drugKindFromInit();
  let ippanmeiState: IppanmeiState | undefined = ippanmeiStateFromInit();
  let amountInput: string = amountInputFromInit();
  let amountUnit: string = amountUnitFromInit();
  let 不均等レコード: 不均等レコード | undefined = init.不均等レコード;
  let 負担区分レコード: 負担区分レコード | undefined = init.負担区分レコード;
  let 薬品補足レコード: 薬品補足レコード[] | undefined = init.薬品補足レコード;

  let edit剤形区分 = false;
  let edit用法レコード = false;
  let edit用法補足レコード = false;
  let edit薬剤種別 = false;
  let edit不均等レコード = false;
  let edit負担区分レコード = false;
  let edit薬品補足レコード = false;

  $: isEditing =
    edit剤形区分 ||
    edit用法レコード ||
    edit用法補足レコード ||
    edit薬剤種別 ||
    edit不均等レコード ||
    edit負担区分レコード ||
    edit薬品補足レコード;

  function drugKindFromInit(): DrugKind | undefined {
    if (init?.薬品レコード) {
      const rec = init.薬品レコード;
      if (
        rec.薬品コード種別 &&
        rec.薬品コード &&
        rec.薬品名称 &&
        ((rec.情報区分 === "医薬品" && rec.単位名) ||
          rec.情報区分 === "医療材料")
      ) {
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

  async function spawnIppanmeiResolver(iyakuhincode: number) {
    let m = await api.getIyakuhinMaster(iyakuhincode, at);
    ippanmeiState = ippanmeiStateFromMaster(m);
  }

  function ippanmeiStateFromInit(): IppanmeiState | undefined {
    let ippanmeiState: IppanmeiState | undefined = init?.ippanmeiState;
    if (ippanmeiState === undefined) {
      if (init?.薬品レコード?.薬品コード種別 === "一般名コード") {
        ippanmeiState = { kind: "is-ippanmei" };
      } else if (
        init?.薬品レコード?.薬品コード種別 ===
        "レセプト電算処理システム用コード"
      ) {
        spawnIppanmeiResolver(parseInt(init.薬品レコード.薬品コード))
      }
    }
    return ippanmeiState;
  }

  function amountInputFromInit(): string {
    if (init?.薬品レコード) {
      return init.薬品レコード.分量;
    } else if (init?.amount !== undefined) {
      return init.amount.toString();
    } else {
      return "";
    }
  }

  function amountUnitFromInit(): string {
    if (init?.薬品レコード) {
      return init.薬品レコード.単位名;
    } else {
      return "";
    }
  }

  function doEnter() {
    let 調剤数量 = 1;
    if (剤形区分 === "内服" || 剤形区分 === "頓服") {
      調剤数量Input = 調剤数量Input.trim();
      if (調剤数量Input === "") {
        alert("調剤数量が設定されていません。");
        return;
      }
      調剤数量 = parseInt(toHankaku(調剤数量Input));
    }
    if (!(調剤数量 > 0)) {
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
    if (amountInput == undefined) {
      alert("用量が設定されていません。");
      return;
    }
    const amount = parseFloat(toHankaku(amountInput));
    if (isNaN(amount)) {
      alert("用量の入力が数値でありません。");
      return;
    }
    const 情報区分: 情報区分 = 剤形区分 === "医療材料" ? "医療材料" : "医薬品";
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
      薬品補足レコード,
      負担区分レコード,
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
    onEnter(rp, ippanmeiState);
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
    if (value !== 剤形区分) {
      if (value === "医療材料" || 剤形区分 === "医療材料") {
        // 調剤数量Input = "";
        用法レコード = undefined;
        用法補足レコード = undefined;
        drugKind = undefined;
        amountInput = "";
        amountUnit = "";
        不均等レコード = undefined;
        薬品補足レコード = undefined;
      }
      剤形区分 = value;
      edit剤形区分 = false;
    }
  }

  function onDone用法(value: 用法レコード) {
    用法レコード = value;
    edit用法レコード = false;
  }

  function onDone用法補足レコード(value: 用法補足レコード[] | undefined) {
    用法補足レコード = value;
    edit用法補足レコード = false;
  }

  function onDone薬剤種別(value: DrugKind, ippan: IppanmeiState) {
    drugKind = value;
    ippanmeiState = ippan;
    amountUnit = drugKind.単位名;
    edit薬剤種別 = false;
  }

  function onDone薬剤種別Kizai(value: DrugKind) {
    onDone薬剤種別(value, { kind: "has-no-ippanmei" });
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

  function doCancel() {
    onCancel();
  }

  function doDelete() {
    if (onDelete && confirm("この薬剤を削除していいですか？")) {
      onDelete();
    }
  }

  function doIppan() {
    console.log("ippanmeiState", ippanmeiState);
    if (ippanmeiState?.kind === "has-ippanmei" && drugKind) {
      drugKind.薬品コード種別 = "一般名コード";
      drugKind.薬品コード = ippanmeiState.code;
      drugKind.薬品名称 = ippanmeiState.name;
      drugKind = drugKind;
      ippanmeiState = { kind: "is-ippanmei" };
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div>
    <div>
      <ZaikeiKubunForm {剤形区分} onChange={onDone剤形区分} />
    </div>
    <div style="margin:6px 0;">
      {#if !edit薬剤種別}
        <div style="line-height:1.5em;">
          {#if 剤形区分 !== "医療材料"}
            <span style="cursor:pointer" on:click={() => (edit薬剤種別 = true)}
              >{drugKind ? drugKind.薬品名称 : "（薬品未設定）"}</span
            >
            {#if ippanmeiState?.kind === "has-ippanmei"}
              <a class="ippan-link" on:click={doIppan}>一般名有</a>
            {/if}
          {:else if 剤形区分 === "医療材料"}
            <span style="cursor:pointer" on:click={() => (edit薬剤種別 = true)}
              >{drugKind ? drugKind.薬品名称 : "（器材未設定）"}</span
            >
          {/if}
        </div>
      {:else}
        <div style="border:1px solid gray;border-radius:6px;padding:10px;">
          {#if 剤形区分 !== "医療材料"}
            <DrugKindForm
              {drugKind}
              {at}
              onDone={onDone薬剤種別}
              onCancel={() => (edit薬剤種別 = false)}
              searchText={init.iyakuhinSearchText ?? ""}
            />
          {:else if 剤形区分 === "医療材料"}
            <KizaiKindForm
              {drugKind}
              {at}
              onDone={onDone薬剤種別Kizai}
              onCancel={() => (edit薬剤種別 = false)}
              searchText={init.iyakuhinSearchText ?? ""}
            />
          {/if}
        </div>
      {/if}
    </div>
    <div style="margin:6px 0;">
      <AmountForm bind:amount={amountInput} unit={amountUnit} />
    </div>
    <div style="margin:6px 0;">
      {#if edit不均等レコード}
        <div style="border:1px solid gray;border-radius:6px;padding:10px;">
          <UnevenForm {不均等レコード} onDone={onDone不均等レコード} />
        </div>
      {:else if 不均等レコード}
        <span
          style="cursor:pointer"
          on:click={() => (edit不均等レコード = true)}
          >({unevenRep(不均等レコード)})</span
        >
      {/if}
    </div>
    {#if edit薬品補足レコード}
      <div style="border:1px solid gray;border-radius:6px;padding:10px;">
        <DrugAdditionForm
          {薬品補足レコード}
          onDone={onDone薬品補足レコード}
          onClose={() => (edit薬品補足レコード = false)}
        />
      </div>
    {:else if 薬品補足レコード}
      <div
        style="cursor:pointer;"
        on:click={() => (edit薬品補足レコード = true)}
      >
        <ul style="margin-top:0;margin-bottom:0">
          {#each 薬品補足レコード ?? [] as rec}
            <li>{rec.薬品補足情報}</li>
          {/each}
        </ul>
      </div>
    {/if}
    <div style="margin:6px 0;">
      {#if !edit用法レコード}
        <div on:click={() => (edit用法レコード = true)} style="cursor:pointer;">
          {#if 用法レコード}
            {用法レコード.用法名称}
            {#if 用法レコード.用法コード === freeStyleUsageCode}
              <span
                style="font-size:12px;color:green;border:1px solid green;border-radius:3px;padding:2px 4px;"
                >free</span
              >
            {/if}
          {:else}
            （用法未設定）
          {/if}
        </div>
      {:else}
        <div style="border:1px solid gray;border-radius:6px;padding:10px;">
          <UsageForm
            用法={用法レコード}
            onDone={onDone用法}
            onCancel={() => (edit用法レコード = false)}
          />
        </div>
      {/if}
    </div>
    {#if edit用法補足レコード}
      <div style="border:1px solid gray;border-radius:6px;padding:10px;">
        <UsageAdditionForm
          {用法補足レコード}
          onDone={onDone用法補足レコード}
          onClose={() => (edit用法補足レコード = false)}
        />
      </div>
    {:else if 用法補足レコード}
      <div
        on:click={() => (edit用法補足レコード = true)}
        style="cursor:pointer;user-select:none;"
      >
        <ul style="margin-top:6px;margin-bottom:6px;">
          {#each 用法補足レコード as hosoku}
            <li>{hosoku.用法補足区分}：{hosoku.用法補足情報}</li>
          {/each}
        </ul>
      </div>
    {/if}
    {#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
      <div>
        <EditChouzaiSuuryouForm
          bind:調剤数量={調剤数量Input}
          unit={timesRep(剤形区分)}
        />
      </div>
    {/if}
    <div style="margin:6px 0;">
      {#if edit負担区分レコード}
        <div style="border:1px solid gray;border-radius:6px;padding:10px;">
          <KouhiForm
            {負担区分レコード}
            {kouhiList}
            onDone={onDone負担区分レコード}
          />
        </div>
      {:else if 負担区分レコード}
        <span
          style="user-select:none;cursor:pointer"
          on:click={() => (edit負担区分レコード = true)}
          >{kouhiRep(負担区分レコード)}</span
        >
      {/if}
    </div>
  </div>
  <div style="margin-top:10px;">
    {#if !isEditing}
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;margin:0"
        on:click={doEnter}
      >
        <CheckCircle color="#00f" width="22" />
      </a>
      {#if onDelete}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:3px;margin:0"
          on:click={doDelete}
        >
          <Trash color="#00f" width="22" />
        </a>
      {/if}
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;margin:0;"
        on:click={doCancel}
      >
        <XCircle color="#f99" width="22" />
      </a>
    {/if}
    <a
      href="javascript:void(0)"
      on:click={() => (edit不均等レコード = !edit不均等レコード)}>不均等</a
    >
    <a
      href="javascript:void(0)"
      on:click={() => (edit薬品補足レコード = !edit薬品補足レコード)}
      >薬品補足</a
    >
    <a
      href="javascript:void(0)"
      on:click={() => (edit用法補足レコード = !edit用法補足レコード)}
      >用法補足</a
    >
    {#if kouhiList.length > 0}
      <a
        href="javascript:void(0)"
        on:click={() => (edit負担区分レコード = !edit負担区分レコード)}>公費</a
      >
    {/if}
  </div>
</div>

<style>
  .ippan-link {
    white-space: nowrap;
    font-size: 0.8em;
    border: 1px solid blue;
    padding: 1px 6px;
    border-radius: 6px;
    background: rgba(0, 0, 255, 0.05);
  }
</style>
