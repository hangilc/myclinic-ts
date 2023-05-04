<script lang="ts">
  import api from "@/lib/api";
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "@/lib/SelectItem.svelte";
  import {
    DrugCategory,
    type IyakuhinMaster,
    type PrescExample,
  } from "myclinic-model";
  import { toZenkaku } from "@/lib/zenkaku";
  import { fade } from "svelte/transition";
  import Dialog from "@/lib/Dialog.svelte";
  import { setFocus } from "@/lib/set-focus";

  export let destroy: () => void;

  let drugIndex = 1;
  let searchText: string = "";
  let texts: string[] = [];
  let selected: Writable<string | null> = writable(null);
  let textarea: HTMLTextAreaElement;
  let copiedVisible = false;

  selected.subscribe((s) => {
    if (s == null) {
      return;
    }
    const i = drugIndex++;
    const idx = toZenkaku(`${i})`);
    textarea.value = textarea.value + `${idx}${s}\n`;
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t === "") {
      return;
    }
    const shohos = await api.searchShohouSample(t);
    const prescs = await api.searchPrescExample(t);
    const result: string[] = [];
    result.push(...shohos);
    result.push(...prescs.map((r) => formatPrescExample(...r)));
    texts = result;
  }

  function formatPrescExample(ex: PrescExample, m: IyakuhinMaster): string {
    const name = m.name;
    switch (ex.category) {
      case DrugCategory.Naifuku.code: {
        return `${name} ${ex.amount}${m.unit}\n　　${ex.usage} ${ex.days}日分`;
      }
      case DrugCategory.Tonpuku.code: {
        return `${name} １回${ex.amount}${m.unit}\n　　${ex.usage} ${ex.days}回分`;
      }
      case DrugCategory.Gaiyou.code: {
        return `${name} ${ex.amount}${m.unit}\n　　${ex.usage}`;
      }
      default:
        return "";
    }
  }

  function formatSearchResult(src: string): string {
    return src.replaceAll("\n", "<br />");
  }

  async function doCopy() {
    if (navigator) {
      await navigator.clipboard.writeText(textarea.value);
      copiedVisible = true;
      setTimeout(() => {
        copiedVisible = false;
        destroy();
      }, 800);
    }
  }

</script>

<Dialog {destroy} title="処方サンプル検索">
  <textarea readonly bind:this={textarea} />
  <div class="commands1">
    <button on:click={doCopy}>コピー</button>
    {#if copiedVisible}
    <span out:fade={{duration: 1800}} class="copied-notice">Copied!</span>
    {/if}
  </div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} use:setFocus />
    <button type="submit">検索</button>
  </form>
  <div class="select">
    {#each texts as t}
      <SelectItem {selected} data={t}>{@html formatSearchResult(t)}</SelectItem>
    {/each}
  </div>
</Dialog>

<style>
  textarea {
    width: 100%;
    box-sizing: border-box;
    height: 10em;
    resize: vertical;
    margin-bottom: 0;
  }

  .commands1 {
    margin-top: 0px;
    margin-bottom: 10px;
  }

  .select {
    height: 10em;
    resize: vertical;
    width: 400px;
    margin-top: 6px;
  }

  .copied-notice {
    color: var(--primary-color);
  }

  .select :global(.select-item) {
    margin: 2px 0;
    padding: 4px;
  }

  .select :global(.select-item:nth-child(odd):not(:hover):not(.selected)) {
    background-color: hsla(60, 100%, 85%, 0.3);
  }
</style>
