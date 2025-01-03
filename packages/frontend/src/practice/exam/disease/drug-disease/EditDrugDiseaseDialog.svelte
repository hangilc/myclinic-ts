<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { fullNameOfFix, type DrugDisease } from "@/lib/drug-disease";
  import type { ByoumeiMaster, ShuushokugoMaster } from "myclinic-model";
  import { truncateDrugName } from "../drug-disease-util";

  export let destroy: () => void;
  export let item: DrugDisease;
  export let at: string;
  export let onEnter: (dd: DrugDisease) => void;
  export let title = "薬剤病名の編集";
  let drugName = item.drugName;
  let diseaseName = item.diseaseName;
  let searchText = "";
  let byoumeiResult: ByoumeiMaster[] = [];
  let adjResult: ShuushokugoMaster[] = [];
  let searchMode: "byoumei" | "adj" = "byoumei";
  let fixPre = item.fix?.pre ?? [];
  let fixName = item.fix?.name ?? "";
  let fixPost = item.fix?.post ?? [];
  let fixFullName: string = "";

  updateFixFullName();

  function updateFixFullName() {
    if (fixName !== "") {
      fixFullName = fullNameOfFix({
        pre: fixPre,
        name: fixName,
        post: fixPost,
      });
    } else {
      fixFullName = "";
    }
    diseaseName = fixFullName;
  }

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "") {
      if (searchMode === "byoumei") {
        byoumeiResult = await api.searchByoumeiMaster(t, at);
      } else if (searchMode === "adj") {
        adjResult = await api.searchShuushokugoMaster(t, at);
      }
    }
  }

  function doByoumeiSelect(name: string) {
    fixName = name;
    updateFixFullName();
    // if (diseaseName === "") {
    //   diseaseName = name;
    // }
    searchText = "";
    byoumeiResult = [];
  }

  function compileFix():
    | { pre: string[]; name: string; post: string[] }
    | undefined {
    if (fixName !== "") {
      return {
        pre: fixPre,
        name: fixName,
        post: fixPost,
      };
    } else {
      return undefined;
    }
  }

  function doAdjSelect(m: ShuushokugoMaster) {
    if (m.isPrefix) {
      fixPre.push(m.name);
    } else {
      fixPost.push(m.name);
    }
    updateFixFullName();
    adjResult = [];
  }

  async function doEnter() {
    drugName = drugName.trim();
    if (drugName === "") {
      alert("薬剤名が空白です。");
      return;
    }
    diseaseName = diseaseName.trim();
    if (diseaseName === "") {
      alert("症病名が空白です。");
      return;
    }
    const dd: DrugDisease = {
      drugName,
      diseaseName,
      fix: compileFix(),
    };
    destroy();
    onEnter(dd);
  }

  function doTruncateDrugName() {
    drugName = truncateDrugName(drugName);
  }
</script>

<Dialog {title} {destroy} styleWidth="300px">
  <div class="row">
    薬剤名：<input type="text" bind:value={drugName} /> <a href="javascript:void(0)" on:click={doTruncateDrugName}>短縮</a>
  </div>
  <div class="row">
    傷病名：<input type="text" bind:value={diseaseName} />
  </div>
  <div>Ｆｉｘ：<span>{fixFullName}</span> <button>削除</button></div>
  <div>
    <div class="commands row">
      <button on:click={doEnter}>入力</button>
    </div>
    <hr />
    <div class="row">
      <input type="radio" value="byoumei" bind:group={searchMode} />病名
      <input type="radio" value="adj" bind:group={searchMode} />修飾語
    </div>
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:value={searchText} />
      <button type="submit">検索</button>
    </form>
  </div>
  <div class="result-wrapper">
    {#if searchMode === "byoumei"}
      <div>
        {#each byoumeiResult as m (m.shoubyoumeicode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="item" on:click={() => doByoumeiSelect(m.name)}>{m.name}</div>
        {/each}
      </div>
    {:else if searchMode === "adj"}
      <div>
        {#each adjResult as m (m.shuushokugocode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="item" on:click={() => doAdjSelect(m)}>{m.name}</div>
        {/each}
      </div>
    {/if}
  </div>
</Dialog>

<style>
  .row {
    margin: 4px 0;
  }

  .result-wrapper {
    max-height: 300px;
    overflow-y: auto;
    cursor: pointer;
    margin-top: 10px;
  }

  .result-wrapper .item:hover {
    background-color: #ddd;
  }
</style>
