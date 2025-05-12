<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Text, Visit } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  import { SimpleLoader, SkipLoader, type Loader } from "./search-text/loader";
  import { onMount, tick } from "svelte";
  

  export let destroy: () => void;
  export let patient: Patient | null;
  let patientId: number | null;
  $: patientId = patient?.patientId ?? null;
  let textVisits: [Text, Visit][] = [];
  const nPerPage = 10;
  let searchText = "";
  let text = "";
  let loader: Loader | undefined = undefined;
  let inputElement: HTMLInputElement;
  let pageNumber: number | undefined = undefined;
  let hasPrev: boolean = false;
  let hasNext: boolean = false;
  let skipHikitsugi = true;
  let resultElement: HTMLDivElement;

  onMount(() => inputElement?.focus());
  
  async function load() {
	if( loader ){
	  textVisits = await loader.load();
	  pageNumber = loader.getPage();
	  hasPrev = loader.hasPrev();
	  hasNext = loader.hasNext();
	  await tick();
	  if( resultElement ){
		resultElement.scrollTop = 0;
	  }
	}
  }

  async function doSearch() {
    let t = searchText.trim();
    if (t !== "" && patientId != null) {
	  if( skipHikitsugi ){
		console.log("skipHikitsugi");
		loader = new SkipLoader(t, patientId, nPerPage);
	  } else {
		let totalPages = 0;
		const totalCount = await api.countSearchTextForPatient(t, patientId);
		if( totalCount > 0 ){
		  totalPages = Math.floor((totalCount - 1) / nPerPage) + 1;
		}
		loader = new SimpleLoader(t, patientId, nPerPage, totalPages);
	  }
	  text = t;
	  load();
    }
  }

  async function doHikitsugiChange() {
	text = "";
	loader = undefined;
	pageNumber = undefined;
  }

  function formatContent(c: string): string {
    return c
      .replaceAll("\n", "<br />")
      .replaceAll(text, `<span class="hit">${text}</span>`);
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

  function doClose(): void {
    destroy();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog {destroy} title="文章検索">
  <div class="top">
    <div class="patient">
      ({patient?.patientId}) {patient?.lastName}{patient?.firstName}
    </div>
    <form on:submit|preventDefault={doSearch} class="form">
      <input type="text" bind:value={searchText} bind:this={inputElement} />
      <button type="submit">検索</button>
	  <input type="checkbox" bind:checked={skipHikitsugi} on:change={doHikitsugiChange} />
	  引継ぎ除外
    </form>
	{#if loader}
	  <a href="javascript:void(0)"
		on:click={hasPrev ? gotoPrev : () => {}}
		class:disabled={!hasPrev}>前へ</a>
	  <span class="page-number">{pageNumber}</span>
	  <a href="javascript:void(0)"
		on:click={hasNext ? gotoNext : () => {}}
		class:disabled={!hasNext}>次へ</a>
	{/if}
    <div class="result" bind:this={resultElement}>
	  {#each textVisits as tv (tv[0].textId)}
        <div class="result-item">
		  <div class="visited-at">
            {FormatDate.f9(tv[1].visitedAt)}
		  </div>
		  <div>
            {@html formatContent(tv[0].content)}
		  </div>
        </div>
	  {/each}
    </div>
    <div class="commands">
	  <button on:click={doClose}>閉じる</button>
    </div>
  </div>
</Dialog>

<style>
  .top {
    width: 26em;
  }
  .patient {
    margin-bottom: 10px;
  }

  .page-number {
	margin: 6px 0.3em;
  }

  .form {
    margin-bottom: 10px;
  }

  a.disabled {
	color: gray;
	cursor:default;
  }

  .result {
    height: 30em;
    overflow-y: auto;
    margin-top: 10px;
    border: 1px solid gray;
    padding: 0 10px;
    font-size: 14px;
  }

  .result-item {
    border: 1px solid gray;
    padding: 10px;
    margin: 10px 0;
  }

  .result-item .visited-at {
    font-weight: bold;
    color: green;
  }

  .result-item :global(span.hit) {
    color: red;
    font-weight: bold;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
