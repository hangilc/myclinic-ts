<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Text, Visit } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  import { isShohousen } from "@/lib/shohousen/parse-shohousen";
  import { onMount, tick } from "svelte";

  export let destroy: () => void;
  export let patient: Patient;
  let prescTexts: [Text, Visit][] = [];
  let current: [Text, Visit][] = [];
  const nPerPage = 10;
  let currentPage = 0;
  let totalPages = 0;
  let loading = true;
  let resultElement: HTMLDivElement;

  onMount(async () => {
    loadPrescHistory();
	loading = false;
  });

  async function loadPrescHistory() {
    try {
      const candidates = await api.searchTextForPatient(
		"院外処方", patient.patientId, 1000, 0);
	  prescTexts = candidates.filter(([t, _v]) => isShohousen(t.content));
      prescTexts.sort((a, b) => 
        new Date(b[1].visitedAt).getTime() - new Date(a[1].visitedAt).getTime()
      );
	  console.log("totalPages", prescTexts.length);
      totalPages = Math.ceil(prescTexts.length / nPerPage);
      updateCurrent();
    } catch (error) {
      console.error("Failed to load prescription history:", error);
      alert("処方履歴の読み込みに失敗しました。");
    }
  }

  async function updateCurrent() {
    const startIndex = currentPage * nPerPage;
    const endIndex = startIndex + nPerPage;
	current = prescTexts.slice(startIndex, endIndex);
    await tick();
    if (resultElement) {
      resultElement.scrollTop = 0;
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

  function doClose(): void {
    destroy();
  }

  function formatContent(content: string): string {
    return content.replaceAll("\n", "<br />");
  }

  $: hasPrev = currentPage > 0;
  $: hasNext = currentPage < totalPages - 1;
  $: pageNumber = totalPages > 0 ? currentPage + 1 : 0;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Dialog {destroy} title="処方履歴">
  <div class="top">
    <div class="patient">
      ({patient?.patientId}) {patient?.lastName}{patient?.firstName}
    </div>
    
    {#if loading}
      <div class="loading">読み込み中...</div>
    {:else if totalPages > 0}
      <div class="pagination">
        <a href="javascript:void(0)"
          on:click={hasPrev ? gotoPrev : () => {}}
          class:disabled={!hasPrev}>前へ</a>
        <span class="page-number">{pageNumber} / {totalPages}</span>
        <a href="javascript:void(0)"
          on:click={hasNext ? gotoNext : () => {}}
          class:disabled={!hasNext}>次へ</a>
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
  .top {
    width: 26em;
  }
  
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

  a.disabled {
    color: gray;
    cursor: default;
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
</style>
