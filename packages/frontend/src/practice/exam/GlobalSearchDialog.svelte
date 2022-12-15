<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import type { Patient, Visit, Text } from "myclinic-model";
  import Nav from "@/lib/Nav.svelte";
  import * as kanjidate from "kanjidate";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";

  export let destroy: () => void;
  let searchTextValue = "";
  let searchText = "";
  let result: [Text, Visit, Patient][] = [];
  let pageTotal = 0;
  let curPage = 0;
  const itemsPerPage = 10;
  let resultWrapper: HTMLElement;

  function doClose(): void {
    destroy();
  }

  async function doSearch() {
    searchText = searchTextValue.trim();
    if (searchText === "") {
      return;
    }
    const nhits: number = await api.countSearchTextGlobally(searchText);
    result = await api.searchTextGlobally(searchText, itemsPerPage, 0);
    pageTotal = calcPages(nhits, itemsPerPage);
    curPage = 0;
    resultWrapper.scrollTop = 0;
  }

  async function doGotoPage(page: number) {
    result = await api.searchTextGlobally(searchText, itemsPerPage, page * itemsPerPage);
    curPage = page;
    resultWrapper.scrollTop = 0;
  }

  function formatText(c: string): string {
    return c.replaceAll("\n", "<br />")
      .replaceAll(searchText, `<span class="hit">${searchText}</span>`);
  }
</script>

<SurfaceModal destroy={doClose} title="全文検索" width="400px">
  <div class="content">
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:value={searchTextValue} class="search-text-input" autofocus/>
      <button type="submit">検索</button>
    </form>
    {#if pageTotal > 1}
      <Nav bind:page={curPage} bind:total={pageTotal} gotoPage={doGotoPage} />
    {/if}
    <div class="result" bind:this={resultWrapper}>
      {#each result as r}
        {@const text = r[0]}
        {@const visit = r[1]}
        {@const patient = r[2]}
        <div class="item">
          <div>
            <span class="patient">
              [{patient.patientId}] 
              {patient.lastName}
              {patient.firstName}
            </span>
            {kanjidate.format(kanjidate.f2, visit.visitedAt)}
          </div>
          {@html formatText(text.content)}
        </div>
      {/each}
    </div>
    {#if pageTotal > 1}
      <Nav bind:page={curPage} bind:total={pageTotal} gotoPage={doGotoPage} />
    {/if}
  </div>
</SurfaceModal>

<style>
  .content :global(.nav) {
    margin: 6px 0;
  }

  .result {
    width: 400px;
    height: 500px;
    overflow-y: auto;
    resize: vertical;
    border: 1px solid gray;
    padding: 4px;
    margin-top: 6px;
    font-size: 13px;
  }

  .item {
    border: 1px solid gray;
    padding: 6px;
    margin: 6px 0;
  }

  .patient {
    font-weight: bold;
    color: green;
  }

  .content :global(.hit) {
    color: red;
  }
</style>
