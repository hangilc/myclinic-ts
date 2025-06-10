<script lang="ts">
  import api from "@/lib/api";

  import Dialog2 from "@/lib/Dialog2.svelte";
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

  let scale = 1;
  let rotate = 0;
  let contentElement: HTMLDivElement;
  let imgElement: HTMLImageElement;
  let naturalWidth: number;
  let naturalHeight: number;

  function onImgLoad() {
    naturalWidth = imgElement.naturalWidth;
    naturalHeight = imgElement.naturalHeight;
    let cw = contentElement.clientWidth;
    scale = cw / naturalWidth;
    imgElement.width = naturalWidth * scale;
    updateImage();
  }

  function updateImage() {
    if (imgElement && naturalWidth && naturalHeight) {
      if (rotate === 90) {
		console.log("rotate-90");
        imgElement.className = "rotate-90";
      } else if (rotate === 180) {
        imgElement.className = "rotate-180";
      } else if (rotate === 270) {
        imgElement.className = "rotate-270";
      } else {
        imgElement.className = "";
      }
      //imgElement.width = naturalWidth * scale;
    }
  }

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

  function doEnlarge() {
    scale *= 1.25;
    updateImage();
  }

  function doShrink() {
    scale /= 1.25;
    updateImage();
  }

  function doRotateRight() {
    rotate = (rotate + 90) % 360;
    updateImage();
  }

  function doRotateLeft() {
    rotate = (rotate - 90) % 360;
    updateImage();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<!-- svelte-ignore a11y-missing-attribute -->
<Dialog2 {destroy} title="画像一覧">
  <div class="select">
    {#each list as f}
      <SelectItem selected={imgSrc} data={f}>{f}</SelectItem>
    {/each}
  </div>
  <div class="commands">
    {#if inlineImageSrc}
      <a href="javascript:void(0)" on:click={doEnlarge}>拡大</a>
      <a href="javascript:void(0)" on:click={doShrink}>縮小</a>
      <a href="javascript:void(0)" on:click={doRotateRight}>右回転</a>
      <a href="javascript:void(0)" on:click={doRotateLeft}>左回転</a>
    {/if}
    {#if externalImageSrc !== ""}
      <a href={externalImageSrc} target="_blank" rel="noreferrer"
        >別のタブで開く</a
      >
    {/if}
    {#if $imgSrc != null}
      <a href="javascript:void(0)" on:click={() => doDelete($imgSrc)}>削除</a>
    {/if}
    <button on:click={doClose}>閉じる</button>
  </div>
  <div class="content" bind:this={contentElement}>
    {#if inlineImageSrc}
      <img src={inlineImageSrc} bind:this={imgElement} on:load={onImgLoad} />
    {/if}
  </div>
</Dialog2>

<style>
  .select {
    height: 6em;
    resize: vertical;
    margin: 10px;
  }

  .commands {
    margin: 10px;
    text-align: right;
  }

  .content {
    width: 600px;
    height: 500px;
    overflow: auto;
    resize: both;
    margin: 6px;
    position: relative;
  }

  .content :global(img) {
    transform-origin: 0 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  .content :global(img.rotate-90) {
    transform: rotate(90deg) translate(0, -100%);
  }

  .content :global(img.rotate-180) {
    transform: rotate(180deg) translate(-100%, -100%);
  }

  .content :global(img.rotate-270) {
    transform: rotate(270deg) translate(-100%, 0);
  }
</style>
