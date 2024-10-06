<script lang="ts">
  import type { IyakuhinMaster, UsageMaster } from "myclinic-model";
  import api from "../api";
  import { type 剤形区分 } from "./denshi-shohou";
  import type { RP剤情報, 用法補足レコード, 薬品情報 } from "./presc-info";
  import { tick } from "svelte";
  import Dialog from "../Dialog.svelte";
  import type { FreqUsage } from "../cache";
  import * as cache from "@/lib/cache";
  import { toHankaku } from "../zenkaku";
  import ChevronUp from "@/icons/ChevronUp.svelte";

  export let at: string; // YYYY-MM-DD
  export let rpPresc: RP剤情報 | undefined = undefined;
  export let destroy: () => void;
  export let onEnter: (drug: RP剤情報) => void;
  export let onDelete: (drug: RP剤情報) => void = (_) => {};
  const customUsageCode = "0X0XXXXXXXXX0000";

  let rp剤形区分: 剤形区分 = rpPresc ? rpPresc.剤形レコード.剤形区分 : "内服";
  let rp調剤数量_value: string = rpPresc
    ? rpPresc.剤形レコード.調剤数量.toString()
    : "";
  let rp用法コード: string = rpPresc
    ? rpPresc.用法レコード.用法コード
    : customUsageCode;
  let rp用法名称: string = rpPresc ? rpPresc.用法レコード.用法名称 : "";
  let rp用法補足レコード: 用法補足レコード[] = rpPresc?.用法補足レコード ?? [];
  let rpDrugs: 薬品情報[] = rpPresc?.薬品情報グループ ?? [];

  let showDrugSearch = false;
  let universalNameOnly = true;
  let drugSearchText = "";
  let drugSearchResult: IyakuhinMaster[] = [];
  let drugMaster: IyakuhinMaster | undefined = undefined;
  let drugAmount: string = "";
  let searchTextInput: HTMLInputElement;

  let usageSelectMode: "freq" | "master" | "text" | "aux" | "" = "";
  let usageSearchText = "";
  let usageSearchResult: UsageMaster[] = [];
  let usageSearchTextInput: HTMLInputElement;
  let usageFreeTextValue = "";
  let usageFreeTextInput: HTMLInputElement;
  let youhouHosokuText = "";

  let allFreqUsages: FreqUsage[] = [];
  let freqUsages: FreqUsage[] = [];

  init();
  $: adaptToKubun(allFreqUsages, rp剤形区分);

  async function init() {
    allFreqUsages = await cache.getShohouFreqUsage();
  }

  function adaptToKubun(allUsages: FreqUsage[], kubun: 剤形区分) {
    freqUsages = allUsages.filter((u) => u.剤型区分 == kubun);
  }

  async function doToggleDrugSearch() {
    showDrugSearch = !showDrugSearch;
    await tick();
    if (showDrugSearch) {
      if (searchTextInput) {
        searchTextInput.focus();
      }
    }
  }

  async function doDrugSearch() {
    const t = drugSearchText.trim();
    if (t) {
      let rs = await api.searchIyakuhinMaster(t, at);
      if (universalNameOnly) {
        drugSearchResult = rs.filter((r) => !r.name.includes("「"));
      } else {
        drugSearchResult = rs;
      }
      drugSearchText = "";
    }
  }

  function doDrugSelected(m: IyakuhinMaster) {
    drugMaster = m;
    showDrugSearch = false;
    drugSearchResult = [];
  }

  function doAddDrug() {
    if (!drugMaster) {
      alert("医薬品が選択されていません。");
      return;
    }
    drugAmount = drugAmount.trim();
    let amount = parseFloat(toHankaku(drugAmount));
    if (isNaN(amount)) {
      alert("薬品分量が不適切です。");
      return;
    }
    const m = drugMaster;
    const d: 薬品情報 = {
      薬品レコード: {
        情報区分: "医薬品",
        薬品コード種別: "レセプト電算処理システム用コード",
        薬品コード: m.iyakuhincode.toString(),
        薬品名称: m.name,
        分量: drugAmount,
        力価フラグ: "薬価単位",
        単位名: m.unit,
      },
    };
    const drugs = [...rpDrugs, d];
    rpDrugs = [];
    drugMaster = undefined;
    drugAmount = "";
    rpDrugs = drugs;
  }

  function doToggleFreqUsage() {
    if (usageSelectMode === "freq") {
      usageSelectMode = "";
    } else {
      usageSelectMode = "freq";
    }
  }

  async function doToggleUsageSearch() {
    if (usageSelectMode === "master") {
      usageSelectMode = "";
    } else {
      usageSelectMode = "master";
      await tick();
      if (usageSearchTextInput) {
        usageSearchTextInput.focus();
      }
    }
  }

  async function doToggleUsageFreeText() {
    if (usageSelectMode === "text") {
      usageSelectMode = "";
    } else {
      usageSelectMode = "text";
      await tick();
      if (usageFreeTextInput) {
        usageFreeTextInput.focus();
      }
    }
  }

  function doToggleUsageAux() {
    if (usageSelectMode === "aux") {
      usageSelectMode = "";
    } else {
      usageSelectMode = "aux";
    }
  }

  function doToggleUsageEmpty() {
    usageSelectMode = "";
  }

  async function doUsageSearch() {
    let t = usageSearchText.trim();
    if (t) {
      usageSearchResult = await api.selectUsageMasterByUsageName(t);
      t = "";
    }
  }

  function doCancel() {
    destroy();
  }

  function doEnter() {
    let 調剤数量_value = "1";
    if (rp剤形区分 === "内服" || rp剤形区分 === "頓服") {
      調剤数量_value = rp調剤数量_value;
    }
    let 調剤数量 = parseFloat(toHankaku(調剤数量_value));
    if (isNaN(調剤数量)) {
      alert("調剤日数・回数が不適切です。");
      return;
    }
    rp用法名称 = rp用法名称.trim();
    if (rp用法名称 === "") {
      alert("用法が入力されていません。");
      return;
    }
    const 用法補足レコード =
      rp用法補足レコード.length === 0 ? undefined : rp用法補足レコード;
    if (rpDrugs.length === 0) {
      alert("薬品が設定されていません。");
      return;
    }
    let shohou: RP剤情報;
    if (rpPresc) {
      shohou = Object.assign({}, rpPresc, {
        剤形レコード: {
          剤形区分: rp剤形区分,
          調剤数量,
        },
        用法レコード: {
          用法コード: rp用法コード,
          用法名称: rp用法名称,
        },
        用法補足レコード,
        薬品情報グループ: rpDrugs,
      });
    } else {
      shohou = {
        剤形レコード: {
          剤形区分: rp剤形区分,
          調剤数量,
        },
        用法レコード: {
          用法コード: rp用法コード,
          用法名称: rp用法名称,
        },
        用法補足レコード,
        薬品情報グループ: rpDrugs,
      };
    }
    destroy();
    onEnter(shohou);
  }

  function doSelectUsageMaster(m: UsageMaster) {
    rp用法コード = m.usage_code;
    rp用法名称 = m.usage_name;
    usageSearchResult = [];
    usageSelectMode = "";
  }

  function doUsageFreeText() {
    usageFreeTextValue = usageFreeTextValue.trim();
    if (usageFreeTextValue === "") {
      return;
    }
    rp用法コード = "0X0XXXXXXXXX0000";
    rp用法名称 = usageFreeTextValue;
    usageSelectMode = "";
  }

  function doFreqSelect(freq: FreqUsage) {
    rp用法コード = freq.用法コード;
    rp用法名称 = freq.用法名称;
    usageSelectMode = "";
  }

  function doDelete() {
    if (confirm("この処方を削除していいですか？")) {
      destroy();
      if (rpPresc) {
        onDelete(rpPresc);
      }
    }
  }

  function doAddYouhouHosoku() {
    youhouHosokuText = youhouHosokuText.trim();
    if (youhouHosokuText === "") {
      return;
    }
    rp用法補足レコード.push({
      用法補足区分: "用法の続き",
      用法補足情報: youhouHosokuText,
    });
    rp用法補足レコード = rp用法補足レコード;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Dialog title="薬品" {destroy} styleWidth="400px">
  <div>
    <input type="radio" bind:group={rp剤形区分} value="内服" />内服
    <input type="radio" bind:group={rp剤形区分} value="頓服" />頓服
    <input type="radio" bind:group={rp剤形区分} value="外用" />外用
  </div>
  <div>
    <div>
      薬品：<a href="javascript:void(0)" on:click={doToggleDrugSearch}
        >マスター</a
      >
    </div>
    {#if showDrugSearch}
      <form on:submit|preventDefault={doDrugSearch}>
        <input
          type="text"
          bind:value={drugSearchText}
          bind:this={searchTextInput}
        />
        <button type="submit">検索</button>
        <input type="checkbox" bind:checked={universalNameOnly} />一般名のみ
      </form>
      <div style="max-height:400px;overflow-y:auto;cursor:pointer;">
        {#each drugSearchResult as m (m.iyakuhincode)}
          <div on:click={() => doDrugSelected(m)}>{m.name}</div>
        {/each}
      </div>
    {/if}
    {#if drugMaster}
      <form on:submit|preventDefault={doAddDrug}>
        <div>{drugMaster.name}</div>
        <input
          type="text"
          style="width:6em"
          bind:value={drugAmount}
        />{drugMaster.unit}
        <button type="submit">追加</button>
      </form>
    {/if}
    <div>
      {#each rpDrugs as drug, i}
        <div>
          {i + 1}. {drug.薬品レコード.薬品名称}
          {drug.薬品レコード.分量}{drug.薬品レコード.単位名}
        </div>
      {/each}
    </div>
  </div>
  <div>
    用法：
    <a href="javascript:void(0)" on:click={doToggleFreqUsage}>頻用</a>
    <a href="javascript:void(0)" on:click={doToggleUsageSearch}>マスター</a>
    <a href="javascript:void(0)" on:click={doToggleUsageFreeText}>自由文章</a>
    <a href="javascript:void(0)" on:click={doToggleUsageAux}>補足</a>
    {#if usageSelectMode === "freq"}
      <div style="height:6em;overflow-y:auto;cursor:pointer;user-select:none">
        {#each freqUsages as freq}
          <div style="cursfor:pointer;" on:click={() => doFreqSelect(freq)}>
            {freq.用法名称}
          </div>
        {/each}
      </div>
    {:else if usageSelectMode === "master"}
      <form on:submit|preventDefault={doUsageSearch}>
        <input
          type="text"
          bind:value={usageSearchText}
          bind:this={usageSearchTextInput}
        />
        <button type="submit">検索</button>
      </form>
      <div style="max-height:400px;overflow-y:auto;cursor:pointer;">
        {#each usageSearchResult as u (u.usage_code)}
          <div on:click={() => doSelectUsageMaster(u)}>{u.usage_name}</div>
        {/each}
      </div>
    {:else if usageSelectMode === "text"}
      <div>
        <input
          type="text"
          bind:this={usageFreeTextInput}
          bind:value={usageFreeTextValue}
        />
        <button on:click={doUsageFreeText}>入力</button>
      </div>
    {:else if usageSelectMode === "aux"}
      <div>
        用法補足：<input type="text" bind:value={youhouHosokuText} />
        <button on:click={doAddYouhouHosoku}>追加</button>
      </div>
    {/if}
    <div>{rp用法名称}</div>
    {#each rp用法補足レコード ?? [] as suppl}
      <div>{suppl.用法補足情報}</div>
    {/each}
  </div>
  <div>
    {#if rp剤形区分 === "内服" || rp剤形区分 === "頓服"}
      <input type="text" style="width: 6em" bind:value={rp調剤数量_value} />
      {#if rp剤形区分 === "内服"}日分{/if}
      {#if rp剤形区分 === "頓服"}回分{/if}
    {/if}
  </div>
  <div style="text-align:right;">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
    {#if rpPresc}
      <button on:click={doDelete}>削除</button>
    {/if}
  </div>
</Dialog>
