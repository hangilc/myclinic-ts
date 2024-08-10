<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import SelectItem from "../SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import type { RP剤情報 } from "./presc-info";
  import { 頻用用法コードMap } from "./denshi-shohou";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import ChevronUp from "@/icons/ChevronUp.svelte";

  export let at: string;
  export let onEnter: (drug: RP剤情報) => void;
  let searchText = "";
  let searchResults: IyakuhinMaster[] = [];
  let showSearchResult = false;
  let master: IyakuhinMaster | undefined;
  let searchSelected: Writable<IyakuhinMaster | null> = writable(null);
  let amountLabel = "";
  let amount = "";
  let unit = "";
  let usage = "";
  let usageCode: string | undefined = undefined;
  let daysLabel = "日数";
  let days = "";
  let daysUnit = "日分";
  let mode: "内服" | "頓服" | "外用" = "内服";
  let searchInput: HTMLInputElement;
  let usageList: [string, string, any][] = [];
  let showUsageList = false;
  let usageItemSelected: Writable<[string, string, any] | null> =
    writable(null);
  let searchInputDisabled = true;

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

  usageItemSelected.subscribe((item) => {
    if (item) {
      const [code, text, config] = item;
      usage = text;
      usageCode = code;
      showUsageList = false;
    }
  });

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
    if( !master ){
      alert("薬剤が指定されていません。");
      return;
    }
    if( isNaN(parseFloat(amount)) ){
      alert("分量の入力が不適切です。");
      return;
    }
    if( unit == "" ){
      alert("分量の単位の入力が不適切です。");
      return;
    }
    let drug: RP剤情報 = {
      剤形レコード: {
        剤形区分: mode,
        調剤数量: daysValue,
      },
      用法レコード: {
        用法コード: usageCode,
        用法名称: usage,
      },
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
        },
      ],
    };
    onEnter(drug);
  }
</script>

<div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={searchInput} />
    <button type="submit">検索</button>
  </form>
  {#if showSearchResult }
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
      </div>
      <span>用法：</span>
      <div
        class="inline-block"
        style="display:flex;items-align:center;gap:4px;"
      >
        <input
          type="text"
          bind:value={usage}
          disabled={searchInputDisabled}
          style="flex-grow:1;"
        />
        {#if showUsageList}
          <a
            href="javascript:void(0)"
            class="chevron"
            on:click={() => (showUsageList = false)}><ChevronUp /></a
          >
        {:else}
          <a
            href="javascript:void(0)"
            class="chevron"
            on:click={() => (showUsageList = true)}><ChevronDown /></a
          >
        {/if}
      </div>
      {#if showUsageList}
        <div style="grid-column:1/span 2" class="usage-examples">
          {#each usageList as usageItem (usageItem[0])}
            <SelectItem data={usageItem} selected={usageItemSelected}>
              <div>{usageItem[1]}</div>
            </SelectItem>
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

  .usage-examples {
    max-height: 180px;
    overflow-y: auto;
  }

  .display {
    margin-top: 10px;
    border: 1px solid gray;
    padding: 10px;
  }

  a.chevron {
    text-decoration: none;
    color: #333;
  }
</style>
