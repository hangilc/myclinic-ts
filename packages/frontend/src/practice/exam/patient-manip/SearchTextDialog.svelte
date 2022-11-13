<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Text, Visit } from "myclinic-model";
  import Nav from "@/lib/Nav.svelte";
  import * as kanjidate from "kanjidate";

  export let patient: Patient;
  let patientId: number | null;
  $: patientId = patient?.patientId;
  let textVisits: [Text, Visit][] = [];
  const nPerPage = 10;
  let dialog: Dialog;
  let searchText: string = "";
  let page = 0;
  let total = 0;
  let text: string = "";

  export function open() {
    dialog.open();
  }

  async function load() {
    if (text !== "") {
      textVisits = await api.searchTextForPatient(
        text,
        patientId,
        nPerPage,
        nPerPage * page
      );
    }
  }

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "") {
      const nhit = await api.countSearchTextForPatient(t, patientId);
      text = t;
      total = calcPages(nhit, nPerPage);
      page = 0;
      load();
    }
  }

  function formatContent(c: string): string {
    return c.replaceAll("\n", "<br />").replaceAll(text, `<span class="hit">${text}</span>`);
  }

  function gotoPage(p: number): void {
    page = p;
    load();
  }

  function onClose(): void {
    searchText = "";
    text = "";
    textVisits = [];
  }
</script>

<Dialog bind:this={dialog} width="26em" {onClose}>
  <span slot="title">文章検索</span>
  <div class="patient">
    ({patient?.patientId}) {patient?.lastName}{patient?.firstName} 
  </div>
  <form on:submit|preventDefault={doSearch} class="form">
    <input type="text" bind:value={searchText} autofocus/>
    <button type="submit">検索</button>
  </form>
  <Nav {page} {total} {gotoPage} />
  <div class="result">
    {#each textVisits as tv (tv[0].textId)}
      <div class="result-item">
        <div class="visited-at">
          {kanjidate.format(kanjidate.f9, tv[1].visitedAt)}
        </div>
        <div>
          {@html formatContent(tv[0].content)}
        </div>
      </div>
    {/each}
  </div>
</Dialog>

<style>
  .patient {
    margin-bottom: 10px;
  }

  .form {
    margin-bottom: 10px;
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
</style>
