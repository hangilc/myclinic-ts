<script lang="ts">
  import type { UsageMaster } from "myclinic-model";
  import api from "../api";
  import { type FreqUsage } from "../cache";
  import Dialog from "../Dialog.svelte";
  import { onMount } from "svelte";
  import * as cache from "@/lib/cache";

  export let destroy: () => void;
  let usages: FreqUsage[] = [];
  let searchText = "";
  let searchResult: UsageMaster[] = [];
  let zaikeiKubun: "内服" | "頓服" | "外用" = "内服";
  let master: UsageMaster | undefined = undefined;
  let searchInputText: HTMLInputElement;

  init();
  onMount(() => {
    searchInputText.focus();
  });

  async function init() {
    usages = await cache.getShohouFreqUsage();
  }

  async function doSearch() {
    let t = searchText.trim();
    if (t) {
      searchResult = await api.selectUsageMasterByUsageName(t);
      t = "";
    }
  }

  function resolve剤型区分(m: UsageMaster): "内服" | "頓服" | "外用" {
    if (m.kubun_name === "内服") {
      if (m.timing_name === "頓用指示型") {
        return "頓服";
      } else {
        return "内服";
      }
    } else {
      return "外用";
    }
  }

  function doSelectMaster(m: UsageMaster) {
    master = m;
    zaikeiKubun = resolve剤型区分(m);
    searchResult = [];
  }

  function doAdd() {
    if (master) {
      const us = [...usages, {
        剤型区分: zaikeiKubun,
        用法コード: master.usage_code,
        用法名称: master.usage_name,
      }];
      usages = [];
      usages = us;
      master = undefined;
      searchText = "";
    }
  }

  function doClose() {
    destroy();
  }

  async function doEnter() {
    alert("not implemented yet");
    // await cache.updateShohouFreqUsage(usages);
    // destroy();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Dialog title="登録用法管理" {destroy} styleWidth="400px">
  <div class="enter">
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:value={searchText} bind:this={searchInputText}/>
      <button type="submit">検索</button>
    </form>
  </div>
  <div style="max-height:200px;overflow-y:auto;">
    {#each searchResult as master (master.usage_code)}
      <div style="cursor:pointer" on:click={() => doSelectMaster(master)}>
        {master.usage_name}
      </div>
    {/each}
  </div>
  {#if master}
    <div>{master.usage_name}</div>
  {/if}
  <div style="margin:10px 0;">
    <input type="radio" bind:group={zaikeiKubun} value="内服" />内服
    <input type="radio" bind:group={zaikeiKubun} value="頓服" />頓服
    <input type="radio" bind:group={zaikeiKubun} value="外用" />外用
    <button on:click={doAdd}>追加</button>
  </div>
  <div style="height:300px;overflow-y:auto;resize:vertical;">
    {#each usages as item, i}
      <div>
        {i + 1}. {item.用法名称}
      </div>
    {/each}
  </div>
  <div style="text-align:right;margin-top:10px;">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>
