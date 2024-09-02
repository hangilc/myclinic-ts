<script lang="ts">
  import type { IyakuhinMaster, UsageMaster } from "myclinic-model";
  import api from "../api";
  import { type 剤形区分 } from "./denshi-shohou";
  import type { RP剤情報, 用法補足レコード, 薬品情報 } from "./presc-info";
  import { tick } from "svelte";
  import Dialog from "../Dialog.svelte";
  import type { FreqUsage } from "../cache";
  import * as cache from "@/lib/cache";

  export let at: string; // YYYY-MM-DD
  export let destroy: () => void;
  export let onEnter: (drug: RP剤情報) => void;
  const customUsageCode = "0X0XXXXXXXXX0000";

  let rp剤形区分: 剤形区分 = "内服";
  let rp調剤数量_value: string = "";
  let rp用法コード: string = customUsageCode;
  let rp用法名称: string = "";
  let rp用法補足レコード: 用法補足レコード[] = [];
  let rpDrugs: 薬品情報[] = [];

  let showDrugSearch = false;
  let drugSearchText = "";
  let drugSearchResult: IyakuhinMaster[] = [];
  let drugMaster: IyakuhinMaster | undefined = undefined;
  let drugAmount: string = "";
  let searchTextInput: HTMLInputElement;

  let showUsageSearch = false;
  let usageSearchText = "";
  let usageSearchResult: UsageMaster[] = [];
  let usageSearchTextInput: HTMLInputElement;

  let showFreqUsage = false;
  let freqUsages: FreqUsage[] = [];

  init();

  async function init() {
    freqUsages = await cache.getShohouFreqUsage();
  }

  async function doToggleDrugSearch() {
    showDrugSearch = !showDrugSearch;
    console.log("search", showDrugSearch, searchTextInput);
    await tick();
    if( showDrugSearch ){
      if( searchTextInput ){
        searchTextInput.focus();
      }
    }
  }

  async function doDrugSearch() {
    const t = drugSearchText.trim();
    if (t) {
      drugSearchResult = await api.searchIyakuhinMaster(t, at);
      drugSearchText = "";
    }
  }

  function doDrugSelected(m: IyakuhinMaster) {
    drugMaster = m;
    showDrugSearch = false;
    drugSearchResult = [];
  }

  function doAddDrug() {
    if( !drugMaster ){
      alert("医薬品が選択されていません。");
      return;
    }
    drugAmount = drugAmount.trim();
    let amount = parseFloat(drugAmount);
    if( isNaN(amount) ){
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
    showFreqUsage = !showFreqUsage;
  }

  async function doToggleUsageSearch() {
    showUsageSearch = !showUsageSearch;
    if( showUsageSearch ){
      await tick();
      if( usageSearchTextInput ){
        usageSearchTextInput.focus();
      }
    }
  }

  async function doUsageSearch() {
    let t = usageSearchText.trim();
    if( t ){
      usageSearchResult = await api.selectUsageMasterByUsageName(t);
      t = "";
    }
  }

  function doSelectUsageMaster(m: UsageMaster) {
    rp用法コード = m.usage_code;
    rp用法名称 = m.usage_name;
    usageSearchResult = [];
  }

  function doCancel() {
    destroy();
  }

  function doEnter() {
    let 調剤数量_value = "1";
    if( rp剤形区分 === "内服" || rp剤形区分 === "頓服" ){
      調剤数量_value = rp調剤数量_value;
    }
    let 調剤数量 = parseFloat(調剤数量_value);
    if( isNaN(調剤数量) ){
      alert("調剤日数・回数が不適切です。");
      return;
    }
    rp用法名称 = rp用法名称.trim();
    if( rp用法名称 === "" ){
      alert("用法が入力されていません。");
      return;
    }
    const 用法補足レコード = rp用法補足レコード.length === 0 ? undefined : rp用法補足レコード;
    if( rpDrugs.length === 0 ){
      alert("薬品が設定されていません。");
      return;
    }
    const shohou: RP剤情報 = {
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
    destroy();
    console.log("shohou", JSON.stringify(shohou, undefined, 2));
    onEnter(shohou);
  }

  /*
  let searchText = "";
  let searchResults: IyakuhinMaster[] = [];
  let showSearchResult = false;
  let master: IyakuhinMaster | undefined;
  let searchSelected: Writable<IyakuhinMaster | null> = writable(null);
  let amountLabel = "";
  let amount = "";
  let unit = "";
  let usageCode = customUsageCode;
  let usage = "";
  let usageMaster: UsageMaster | undefined = undefined;
  let hosokuIndex = 1;
  let hosokuList: { index: number; code: 用法補足区分; info: string }[] = [];
  let unevenUsage: 不均等レコード | undefined = undefined;
  let daysLabel = "日数";
  let days = "";
  let daysUnit = "日分";
  let mode: "内服" | "頓服" | "外用" = "内服";
  let searchInput: HTMLInputElement;
  let usageList: [string, string, any][] = [];
  let showUsageList = false;
  let freqUsageIndex = 1;
  let freqUsages: { index: number; value: FreqUsage }[] = [];
  let showCloudArrowUp = false;

  $: switch (mode) {
    case "内服": {
      amountLabel = "一日";
      daysLabel = "日数";
      daysUnit = "日分";
      usageList = 頻用用法コードMap["内服"];
      break;
    }
    case "頓服": {
      amountLabel = "一回";
      daysLabel = "回数";
      daysUnit = "回分";
      usageList = 頻用用法コードMap["頓服"];
      break;
    }
    case "外用": {
      amountLabel = "用量";
      daysLabel = "";
      usageList = 頻用用法コードMap["外用"];
      break;
    }
  }

  searchSelected.subscribe((m) => {
    if (m) {
      master = m;
      unit = m.unit;
      showSearchResult = false;
    }
  });

  prep();

  async function prep() {
    const list: { index: number, value: FreqUsage }[] = [];    
    (await cache.getShohouFreqUsage()).forEach(item => {
      list.push({
        index: freqUsageIndex,
        value: item
      });
      freqUsageIndex += 1;
    })
    freqUsages = list;
  }

  onMount(() => {
    searchInput.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t != "") {
      const result = await api.searchIyakuhinMaster(t, at);
      searchResults = result;
      searchSelected.set(null);
      amount = "";
      unit = "";
      showSearchResult = true;
    }
  }

  function doEnter() {
    let daysValue: number;
    if (mode === "外用") {
      daysValue = 1;
    } else {
      daysValue = parseInt(days);
      if (isNaN(daysValue) || daysValue <= 0) {
        alert("日数/回数の入力が正の整数でありません。");
        return;
      }
    }
    if (!master) {
      alert("薬剤が指定されていません。");
      return;
    }
    if (isNaN(parseFloat(amount))) {
      alert("分量の入力が不適切です。");
      return;
    }
    if (unit == "") {
      alert("分量の単位の入力が不適切です。");
      return;
    }
    let 用法補足レコード: 用法補足レコード[] | undefined = hosokuList.map(
      (h) => ({
        用法補足区分: h.code,
        用法補足情報: h.info,
      })
    );
    用法補足レコード =
      用法補足レコード.length === 0 ? undefined : 用法補足レコード;
    let drug: RP剤情報 = {
      剤形レコード: {
        剤形区分: mode,
        調剤数量: daysValue,
      },
      用法レコード: {
        用法コード: usageCode,
        用法名称: usage,
      },
      用法補足レコード,
      薬品情報グループ: [
        {
          薬品レコード: {
            情報区分: "医薬品",
            薬品コード種別: "レセプト電算処理システム用コード",
            薬品コード: master.iyakuhincode.toString(),
            薬品名称: master.name,
            分量: amount,
            力価フラグ: "薬価単位",
            単位名: unit,
          },
          不均等レコード: unevenUsage,
        },
      ],
    };
    onEnter(drug);
  }

  function isInFreq(m: UsageMaster): boolean {
    return (
      freqUsages.find((item) => item.usage_code === m.usage_code) !== undefined
    );
  }

  function setUsageMaster(freq: { index: number, value: FreqUsage}) {
    usageCode = freq.value.record.usage_code;
    usage = master.usage_name;
    usageMaster = master;
    if (!isInFreq(master)) {
      showCloudArrowUp = true;
    }
  }

  function doSetUsageMaster(freq: { index: number, value: FreqUsage}) {
    setUsageMaster(freq);
    showUsageList = false;
  }

  function doOpenUsageDialog() {
    const dlog: UsageDialog = new UsageDialog({
      target: document.body,
      props: {
        destroy: () => dlog.$destroy(),
        onEnter: doSetUsageMaster,
      },
    });
  }

  function doCustomUsageInput() {
    let input = prompt("任意用法");
    if (input) {
      usageCode = customUsageCode;
      usage = input;
    }
    showUsageList = false;
  }

  function doAddHosoku() {
    let info = prompt("用法補足");
    if (info) {
      hosokuList.push({ index: hosokuIndex, code: "用法の続き", info });
      hosokuIndex += 1;
      hosokuList = hosokuList;
    }
  }

  function doEditHosoku(h: { index: number; info: string }) {
    let info = prompt("用法補足", h.info);
    if (info) {
      hosokuList.forEach((item) => {
        if (item.index === h.index) {
          item.info = h.info;
        }
      });
      hosokuList = hosokuList;
    }
  }

  function doDeleteHosoku(index: number) {
    hosokuList = hosokuList.filter((h) => h.index !== index);
  }

  function doUneven() {
    let input = prompt("不均等", "1-1-1");
    if (input) {
      input = toHankaku(input).trim();
      const parts = input.split("-");
      if (parts.length < 2) {
        alert("不均等は２つ以上のパートが必要です。");
        return;
      }
      if (parts.length > 5) {
        alert("不均等のパートは５つ以下でなければなりません。");
        return;
      }
      let uneven: 不均等レコード = {
        不均等１回目服用量: parts[0].trim().toString(),
        不均等２回目服用量: parts[1].trim().toString(),
      };
      if (parts.length >= 3) {
        uneven.不均等３回目服用量 = parts[2].trim().toString();
      }
      if (parts.length >= 4) {
        uneven.不均等４回目服用量 = parts[3].trim().toString();
      }
      if (parts.length >= 5) {
        uneven.不均等５回目服用量 = parts[4].trim().toString();
      }
      unevenUsage = uneven;
    }
  }

  function formatUneven(uneven: 不均等レコード): string {
    let parts: string[] = [
      uneven.不均等１回目服用量,
      uneven.不均等２回目服用量,
      uneven.不均等３回目服用量,
      uneven.不均等４回目服用量,
      uneven.不均等５回目服用量,
    ]
      .filter((s) => s !== undefined)
      .reduce((acc: string[], ele: string | undefined) => {
        if (ele) {
          acc.push(ele);
        }
        return acc;
      }, []);
    return "(" + parts.join("-") + ")";
  }

  async function doUploadUsage() {
    if (usageMaster) {
      let freqs = await api.getShohouFreqUsage();
      if (freqs.find((item) => item.usage_code === usageMaster?.usage_code)) {
        return;
      }
      freqs.push(usageMaster);
      await api.saveShohouFreqUsage(freqs);
      freqUsages = freqs;
      cache.setShohouFreqUsage(freqs);
      showCloudArrowUp = false;
    }
  }
    */
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
      > <button on:click={doAddDrug}>追加</button>
    </div>
    {#if showDrugSearch}
      <form on:submit|preventDefault={doDrugSearch}>
        <input type="text" bind:value={drugSearchText} bind:this={searchTextInput}/>
        <button type="submit">検索</button>
      </form>
      <div style="max-height:400px;overflow-y:auto;cursor:pointer;">
        {#each drugSearchResult as m (m.iyakuhincode)}
          <div on:click={() => doDrugSelected(m)}>{m.name}</div>
        {/each}
      </div>
    {/if}
    <div>
      {#if drugMaster}
        {drugMaster.name} <input type="text" style="width:6em" bind:value={drugAmount}/>{drugMaster.unit}
      {/if}
    </div>
  </div>
  <div>
    用法：
    <a href="javascript:void(0)" on:click={doToggleFreqUsage}>頻用</a>
    <a href="javascript:void(0)" on:click={doToggleUsageSearch}>マスター</a>
    {#if showFreqUsage}
      <div>
        {#each freqUsages as freq}
          <div style="cursor:pointer;" on:click={doFreqSelect}>{freq.用法名称}</div>
        {/each}
      </div>
    {/if}
    {#if showUsageSearch}
      <form on:submit|preventDefault={doUsageSearch}>
        <input type="text" bind:value={usageSearchText} bind:this={usageSearchTextInput}/>
        <button type="submit">検索</button>
      </form>
      <div style="max-height:400px;overflow-y:auto;cursor:pointer;">
        {#each usageSearchResult as u (u.usage_code)}
          <div on:click={() => doSelectUsageMaster(u)}>{u.usage_name}</div>
        {/each}
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
  <div>
    {#each rpDrugs as drug}
      <div>
        {drug.薬品レコード.薬品名称}
        {drug.薬品レコード.分量}{drug.薬品レコード.単位名}
      </div>
    {/each}
  </div>
  <div style="text-align:right;">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<!--
<div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={searchInput} />
    <button type="submit">検索</button>
  </form>
  {#if showSearchResult}
    <div class="search-result">
      {#each searchResults as searchResult (searchResult.iyakuhincode)}
        <SelectItem data={searchResult} selected={searchSelected}>
          {searchResult.name}
        </SelectItem>
      {/each}
    </div>
  {/if}
  <div class="input-area">
    <div>
      <input type="radio" value="内服" bind:group={mode} /> 内服
      <input type="radio" value="頓服" bind:group={mode} /> 頓服
      <input type="radio" value="外用" bind:group={mode} /> 外用
    </div>
    <div class="input-form">
      <span>用量：</span>
      <div class="inline-block">
        <input type="text" style="width:4em" bind:value={amount} />
        <input type="text" style="width:4em" bind:value={unit} />
        <a href="javascript:void(0)" on:click={doUneven}>不均等</a>
        {#if unevenUsage}
          <div>{formatUneven(unevenUsage)}</div>
        {/if}
      </div>
      <span>用法：</span>
      <div class="inline-block">
        <div
          class="usage"
          style="flex-grow:1; display: flex; align-items: center;"
        >
          {usage}
          {#if showCloudArrowUp}
            <a
              href="javascript:void(0)"
              style="margin-left: 4px;"
              on:click={doUploadUsage}><CloudArrowUp /></a
            >
          {/if}
        </div>
        {#each hosokuList as hosoku (hosoku.index)}
          <div>
            <span>{hosoku.info}</span>
            <a href="javascript:void(0)" on:click={() => doEditHosoku(hosoku)}
              >編集</a
            >
            <a
              href="javascript:void(0)"
              on:click={() => doDeleteHosoku(hosoku.index)}>削除</a
            >
          </div>
        {/each}
        <a
          href="javascript:void(0)"
          on:click={() => (showUsageList = !showUsageList)}>頻用</a
        >
        <a href="javascript:void(0)" on:click={doOpenUsageDialog}>検索</a>
        <a href="javascript:void(0)" on:click={doAddHosoku}>補足</a>
      </div>
      {#if showUsageList}
        <div style="grid-column:1/span 2" class="usage-examples">
          <div on:click={doCustomUsageInput}>（任意入力）</div>
          {#each freqUsages as freq (freq.index)}
            <div on:click={() => doSetUsageMaster(freq)}>
              {freq.value.record.用法名称}{#each freq.value.suppl as suppl}
                <span>　{suppl.用法補足情報}</span>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
      {#if daysLabel !== ""}
        <span>{daysLabel}：</span>
        <div class="inline-block">
          <input type="text" style="width:4em" bind:value={days} />
          {daysUnit}
        </div>
      {/if}
    </div>
  </div>
  {#if $searchSelected}
    <div class="display">
      <span>{$searchSelected?.name ?? " "}</span>
      {#if amount !== ""}
        {amount}{unit}
      {/if}
      {usage}
      {#if days !== ""}
        {days}{daysUnit}
      {/if}
    </div>
  {/if}
  <slot enter={doEnter} />
</div>
-->

<style>
  .inline-block {
    display: inline-block;
  }

  .search-result {
    margin: 10px 0;
    max-height: 180px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px;
    border: 1px solid gray;
  }

  .input-area {
    margin: 10px 0;
  }

  .input-form {
    margin: 10px 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px;
  }

  .usage {
    width: auto;
  }

  .usage-examples {
    max-height: 180px;
    overflow-y: auto;
  }

  .usage-examples > div {
    cursor: pointer;
  }

  .display {
    margin-top: 10px;
    border: 1px solid gray;
    padding: 10px;
  }
</style>
