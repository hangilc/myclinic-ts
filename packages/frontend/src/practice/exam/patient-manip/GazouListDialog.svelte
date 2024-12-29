<script lang="ts">
  import api from "@/lib/api";

  import Dialog from "@/lib/Dialog.svelte";
  import { getFileExtension } from "@/lib/file-ext";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  export let destroy: () => void;
  export let patientId: number;
  let list: string[] = [];
  let imgSrc: Writable<string | null> = writable(null);
  let inlineImageSrc: string = "";
  let externalImageSrc: string = "";
  let externals: string[] = ["pdf"];

  imgSrc.subscribe((src) => {
    if (src == null) {
      return;
    }
    const ext = getFileExtension(src) ?? "";
    const url = api.patientImageUrl(patientId, src);
    if (externals.includes(ext)) {
      externalImageSrc = url;
      inlineImageSrc = "";
    } else {
      externalImageSrc = "";
      inlineImageSrc = url;
    }
  });

  init();

  async function init() {
    const files = await api.listPatientImage(patientId);
    list = files.map((f) => f.name);
  }

  function doClose(): void {
    destroy();
  }

  async function doDelete(src: string | null) {
    if (src != null) {
      if (confirm(`この画像を削除していいですか？\n${src}`)) {
        await api.deletePatientImage(patientId, src);
        init();
        imgSrc.set(null);
        inlineImageSrc = "";
        externalImageSrc = "";
      }
    }
  }
</script>

<Dialog {destroy} title="画像一覧">
  <div class="select">
    {#each list as f}
      <SelectItem selected={imgSrc} data={f}>{f}</SelectItem>
    {/each}
  </div>
  {#if inlineImageSrc !== ""}
    <div class="image-wrapper">
      <img src={inlineImageSrc} width="800px" alt="保存画像" />
    </div>
  {/if}
  {#if externalImageSrc !== ""}
    <a href={externalImageSrc} target="_blank" rel="noreferrer"
      >別のタブで開く</a
    >
  {/if}
  <div class="commands">
    {#if $imgSrc != null}
      <a href="javascript:void(0)" on:click={() => doDelete($imgSrc)}>削除</a>
    {/if}
    <button on:click={doClose}>閉じる</button>
  </div>
</Dialog>

<style>
  .select {
    height: 6em;
    resize: vertical;
    margin-bottom: 10px;
  }

  .image-wrapper {
    /* width: 600px; */
    max-height: 500px;
    overflow: auto;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
