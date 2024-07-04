<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import SelectItem from "../SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import type { RP剤情報 } from "./presc-info";

  export let at: string;
  export let onEnter: (drug: RP剤情報) => void;
  let searchText = "";
  let searchResults: IyakuhinMaster[] = [];
  let searchSelected: Writable<IyakuhinMaster | null> = writable(null);
  let amountLabel = "";
  let amount = "";
  let unit = "";
  let usage = "";
  let daysLabel = "日数";
  let days = "";
  let daysUnit = "日分";
  let mode: "内服" | "頓服" | "外用" = "内服";
  let searchInput: HTMLInputElement;

  $: switch (mode) {
    case "内服": {
      amountLabel = "一日";
      daysLabel = "日数";
      daysUnit = "日分";
      break;
    }
    case "頓服": {
      amountLabel = "一回";
      daysLabel = "回数";
      daysUnit = "回分";
      break;
    }
    case "外用": {
      amountLabel = "用量";
      daysLabel = "";
      break;
    }
  }

  searchSelected.subscribe(m => {
    if( m ){

    }
  })

  onMount(() => {
    searchInput.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t != "") {
      const result = await api.searchIyakuhinMaster(t, at);
      searchResults = result;
      let select = result[0];
      searchSelected.set(null);
      amount = "";
      unit = select?.unit ?? "";
    }
  }

  function doEnter() {
    let daysValue: number;
    if( mode === "外用" ){
      daysValue = 1;
    } else {
      daysValue = parseInt(days);
      if( isNaN(daysValue) || daysValue <= 0 ){
        alert("日数/回数の入力が正の整数でありません。");
        return;
      }
    }
    let drug: RP剤情報 = {
      剤形レコード: {
        剤形区分: mode,
        調剤数量: daysValue,
      },
      用法レコード: {
        用法コード: "1013044400000000",
            用法名称: "１日３回朝昼夕食後　服用",
            用法１日回数: 3,
      },
    };
  }
</script>

<div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={searchInput} />
    <button type="submit">検索</button>
  </form>
  {#if searchResults.length > 0}
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
      <span>用量：</span>
      <div class="inline-block">
        <input type="text" bind:value={usage} />
      </div>
      {#if daysLabel !== ""}
        <span>{daysLabel}</span>
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

  .display {
    margin-top: 10px;
    border: 1px solid gray;
    padding: 10px;
  }
</style>
