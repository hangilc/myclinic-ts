<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import type { Patient, Visit, Text } from "myclinic-model";
  import Dialog from "@/lib/Dialog.svelte";
  import { FormatDate } from "myclinic-util";
  import { onMount, tick } from "svelte";
  import { SimpleLoader, SkipLoader, type Loader } from "./loader";

  export let destroy: () => void;
  let loader: Loader | undefined = undefined;
  let pageNumber: number = 0;
  let hasPrev: boolean = false;
  let hasNext: boolean = false;
  let searchTextValue = "";
  let searchText = "";
  let result: [Text, Visit, Patient][] = [];
  const itemsPerPage = 10;
  let resultWrapper: HTMLElement;
  let inputElement: HTMLInputElement;
  let skipHikitsugi: boolean = true;

  onMount(() => inputElement?.focus());

  function doClose(): void {
    destroy();
  }

  async function doHikitsugiChange() {
	searchText = "";
	loader = undefined;
	pageNumber = 0;
	hasPrev = false;
	hasNext = false;
	result = [];
  }

  async function load() {
	if( loader ){
	  result = await loader.load();
	  pageNumber = loader.getPage();
	  hasPrev = loader.hasPrev();
	  hasNext = loader.hasNext();
	  await tick();
	  if( resultWrapper ){
		resultWrapper.scrollTop = 0;
	  }
	}
  }
  
  async function doSearch() {
    searchText = searchTextValue.trim();
    if (searchText === "") {
      return;
    }
	if( skipHikitsugi ){
	  loader = new SkipLoader(searchText, itemsPerPage);
	} else {
	  const totalCount = await api.countSearchTextGlobally(searchText);
	  let pageTotal = calcPages(totalCount, itemsPerPage);
	  loader = new SimpleLoader(searchText, itemsPerPage, pageTotal);
	}
	load();
  }

  function gotoPrev() {
	if( loader && loader.gotoPrev() ){
      load();
	}
  }

  function gotoNext() {
	if( loader && loader.gotoNext() ){
	  load();
	}
  }

  function formatText(c: string): string {
    return c.replaceAll("\n", "<br />")
      .replaceAll(searchText, `<span class="hit">${searchText}</span>`);
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog destroy={doClose} title="全文検索" styleWidth="430px">
  <div class="content">
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:value={searchTextValue} class="search-text-input"
		bind:this={inputElement}/>
      <button type="submit">検索</button>
	  <input type="checkbox" bind:checked={skipHikitsugi} on:change={doHikitsugiChange} />
	  引継ぎ除外
    </form>
    {#if loader}
	<div class="nav">
	  <a href="javascript:void(0)"
		on:click={hasPrev ? gotoPrev : () => {}}
		class:disabled={!hasPrev}>前へ</a>
	  <span class="page-number">{pageNumber}</span>
	  <a href="javascript:void(0)"
		on:click={hasNext ? gotoNext : () => {}}
		class:disabled={!hasNext}>次へ</a>
	</div>
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
            {FormatDate.f2(visit.visitedAt)}
          </div>
          {@html formatText(text.content)}
        </div>
      {/each}
    </div>
    {#if loader}
	<div class="nav">
	  <a href="javascript:void(0)"
		on:click={hasPrev ? gotoPrev : () => {}}
		class:disabled={!hasPrev}>前へ</a>
	  <span class="page-number">{pageNumber}</span>
	  <a href="javascript:void(0)"
		on:click={hasNext ? gotoNext : () => {}}
		class:disabled={!hasNext}>次へ</a>
	</div>
    {/if}
  </div>
</Dialog>

<style>
  .content :global(.nav) {
    margin: 6px 0;
  }

  .nav {
	margin: 6px inherit;
  }

  a.disabled {
	color: gray;
	cursor:default;
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
