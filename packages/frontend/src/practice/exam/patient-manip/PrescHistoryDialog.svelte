<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Text, Visit } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  import { isShohousen } from "@/lib/shohousen/parse-shohousen";
  import { onMount, tick } from "svelte";
  import ListBullet from "@/icons/ListBullet.svelte";
  import MagnifyingGlass from "@/icons/MagnifyingGlass.svelte";
  import { parseShohouDrugs } from "@/lib/parse-shohou2";

  export let destroy: () => void;
  export let patient: Patient;
  let prescTexts: [Text, Visit][] = [];
  let filteredTexts: [Text, Visit][] = [];
  let current: [Text, Visit][] = [];
  const nPerPage = 10;
  let currentPage = 0;
  let totalPages = 0;
  let loading = true;
  let resultElement: HTMLDivElement;
  let drugNames: { name: string; at: string }[] | undefined = undefined;
  let drugNamesSort: "date" | "name" = "date";
  let showDrugNames = false;
  let showSearch = false;
  let searchText = "";
  let searchTextElement: HTMLInputElement;

  onMount(async () => {
    await loadPrescTexts();
    loading = false;
    filteredTexts = prescTexts;
    updateTotalPages();
    updateCurrent();
  });

  async function loadPrescTexts() {
    try {
      const candidates = await api.searchTextForPatient(
        "院外処方",
        patient.patientId,
        1000,
        0,
      );
      prescTexts = candidates.filter(([t, _v]) => isShohousen(t.content));
      prescTexts.sort(
        (a, b) =>
          new Date(b[1].visitedAt).getTime() -
          new Date(a[1].visitedAt).getTime(),
      );
    } catch (error) {
      console.error("Failed to load prescription history:", error);
      alert("処方履歴の読み込みに失敗しました。");
    }
  }

  function updateTotalPages() {
    totalPages = Math.ceil(filteredTexts.length / nPerPage);
  }

  function applySearchFilter() {
    if (searchText === "") {
      filteredTexts = prescTexts;
    } else {
      filteredTexts = prescTexts.filter(([t, _v]) => {
        const c = t.content;
        const ds = parseShohouDrugs(c);
        for (let d of ds) {
          if (d.indexOf(searchText) >= 0) {
            return true;
          }
        }
        return false;
      });
    }
  }

  async function updateCurrent() {
    const startIndex = currentPage * nPerPage;
    const endIndex = startIndex + nPerPage;
    current = filteredTexts.slice(startIndex, endIndex);
    await tick();
    if (resultElement) {
      resultElement.scrollTop = 0;
    }
  }

  function gotoFirst() {
	if( currentPage !== 0 && totalPages > 0 ){
	  currentPage = 0;
	  updateCurrent();
	}
  }

  function gotoPrev() {
    if (currentPage > 0) {
      currentPage--;
      updateCurrent();
    }
  }

  function gotoNext() {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateCurrent();
    }
  }

  function gotoLast() {
	if( currentPage < (totalPages - 1) && totalPages > 0){
	  currentPage = totalPages - 1;
	  updateCurrent();
	}
  }

  function doClose(): void {
    destroy();
  }

  function formatContent(content: string): string {
    if (searchText !== "") {
      content = content.replaceAll(
        searchText,
        `<span class="presc-history-dialog-search-hit">${searchText}</span>`,
      );
      console.log("content", content);
    }
    return content.replaceAll("\n", "<br />");
  }

  $: hasPrev = currentPage > 0;
  $: hasNext = currentPage < totalPages - 1;
  $: pageNumber = totalPages > 0 ? currentPage + 1 : 0;

  function sortDrugNames() {
    if (drugNames !== undefined) {
      if (drugNamesSort === "date") {
        drugNames.sort((a, b) => -a.at.localeCompare(b.at));
      } else if (drugNamesSort === "name") {
        drugNames.sort((a, b) => a.name.localeCompare(b.name));
      }
      drugNames = drugNames;
    }
  }

  function doAllDrugs() {
    if (showDrugNames) {
      showDrugNames = false;
    } else {
      if (drugNames === undefined) {
        const drugNamesMap: Record<string, string> = {};
        for (let [text, visit] of prescTexts) {
          const t = text.content;
          parseShohouDrugs(t).forEach((name) => {
            if (!drugNamesMap[name]) {
              const at = visit.visitedAt.substring(0, 10);
              drugNamesMap[name] = at;
            }
          });
        }
        drugNames = [];
        for (let name of Object.keys(drugNamesMap)) {
          let at = drugNamesMap[name];
          drugNames.push({ name, at });
        }
      }
      sortDrugNames();
      showDrugNames = true;
    }
  }

  function doDrugItemClick(name: string) {
    searchText = name;
    applySearchFilter();
    currentPage = 0;
    updateTotalPages();
    updateCurrent();
    showSearch = true;
  }

  async function toggleSearch() {
    if (showSearch) {
      showSearch = false;
    } else {
      showSearch = true;
      await tick();
      searchTextElement?.focus();
    }
  }

  function doSearch() {
    applySearchFilter();
    currentPage = 0;
    updateTotalPages();
    updateCurrent();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog {destroy} title="処方履歴" styleWidth="400px">
  <div class="top">
    <div class="patient">
      ({patient?.patientId}) {patient?.lastName}{patient?.firstName}
    </div>

    {#if loading}
      <div class="loading">読み込み中...</div>
    {:else if totalPages > 0}
      <div class="pagination">
        <a
          href="javascript:void(0)"
          on:click={gotoFirst}
          class:disabled={currentPage === 0}>最初へ</a
        >
        <a
          href="javascript:void(0)"
          on:click={hasPrev ? gotoPrev : () => {}}
          class:disabled={!hasPrev}>前へ</a
        >
        <span class="page-number">{pageNumber} / {totalPages}</span>
        <a
          href="javascript:void(0)"
          on:click={hasNext ? gotoNext : () => {}}
          class:disabled={!hasNext}>次へ</a
        >
        <a
          href="javascript:void(0)"
          on:click={gotoLast}
          class:disabled={currentPage === totalPages - 1}>最後へ</a
        >
        <a href="javascript:void(0)" class="list-bullet" on:click={doAllDrugs}>
          <ListBullet width="22" />
        </a>
        <a
          href="javascript:void(0)"
          class="magnifying-glass"
          on:click={toggleSearch}
        >
          <MagnifyingGlass width="20" />
        </a>
      </div>
    {/if}

    {#if showSearch}
      <form on:submit|preventDefault={doSearch} class="search-form">
        <input
          type="text"
          bind:value={searchText}
          bind:this={searchTextElement}
        />
        <button type="submit">検索</button>
      </form>
    {/if}

    {#if showDrugNames && drugNames !== undefined}
      <div>
        <input
          type="radio"
          bind:group={drugNamesSort}
          value="date"
          on:change={sortDrugNames}
        />
        日付順
        <input
          type="radio"
          bind:group={drugNamesSort}
          value="name"
          on:change={sortDrugNames}
        /> 名前順
      </div>
      <div class="drug-names-area">
        {#each drugNames as item (item.name)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="drug-item" on:click={() => doDrugItemClick(item.name)}>
            {item.name}
          </div>
        {/each}
      </div>
    {/if}

    <div class="result" bind:this={resultElement}>
      {#if prescTexts.length === 0 && !loading}
        <div class="no-results">処方履歴が見つかりません。</div>
      {:else}
        {#each current as [text, visit] (text.textId)}
          <div class="result-item">
            <div class="visited-at">
              {FormatDate.f9(visit.visitedAt)}
            </div>
            <div class="content">
              {@html formatContent(text.content)}
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="commands">
      <button on:click={doClose}>閉じる</button>
    </div>
  </div>
</Dialog>

<style>
  .patient {
    margin-bottom: 10px;
    font-weight: bold;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .pagination {
    margin-bottom: 10px;
    text-align: center;
  }

  .page-number {
    margin: 0 0.5em;
    font-weight: bold;
  }

  .search-form {
    margin: 10px;
  }

  :global(.presc-history-dialog-search-hit) {
    color: red;
    font-weight: bold;
  }

  a.disabled {
    color: gray;
    cursor: default;
  }

  .drug-names-area {
    margin: 10px;
    border: 1px solid gray;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
  }

  .drug-item {
    cursor: pointer;
  }

  .drug-item:nth-child(even) {
    background-color: #eee;
  }

  .result {
    height: 30em;
    overflow-y: auto;
    margin-top: 10px;
    border: 1px solid gray;
    padding: 0 10px;
    font-size: 14px;
  }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    font-style: italic;
  }

  .result-item {
    border: 1px solid gray;
    padding: 10px;
    margin: 10px 0;
  }

  .result-item .visited-at {
    font-weight: bold;
    color: green;
    margin-bottom: 5px;
  }

  .result-item .content {
    line-height: 1.4;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }

  .list-bullet {
    position: relative;
    top: 6px;
    margin-left: 0.5em;
  }

  .magnifying-glass {
    position: relative;
    top: 4px;
    margin-left: 0.5em;
  }
</style>
