<script lang="ts">
  import ImageDialog from "@/lib/ImageDialog.svelte";
  import type { Readable } from "svelte/store";
  import { UploadStatus, type ScannedDocData } from "./scanned-doc-data";

  export let data: ScannedDocData;
  export let canScan: Readable<boolean>;
  export let onRescan: (data: ScannedDocData) => void;
  export let onDelete: (data: ScannedDocData) => void;

  function doView(): void {
    const url = data.scannedImageUrl;
    const d: ImageDialog = new ImageDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "スキャン画像プレビュー",
        url,
      }
    })
  }

  function doRescan(): void {
    onRescan(data);
  }

  function doDelete(): void {
    onDelete(data);
  }
</script>

<div class="top" data-cy="scanned-document-item" data-index={data.index}>
  {#if data.uploadStatus === UploadStatus.Success}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="green"
      stroke-width="2"
      width="18"
      class="icon"
      data-cy="ok-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  {/if}
  {#if data.uploadStatus === UploadStatus.Failure}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="red"
      stroke-width="2"
      width="18"
      class="icon"
      data-cy="failure-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  {/if}
  <span data-cy="upload-file-name"
    data-scanned-file-name={data.scannedImageFile}
  >{data.uploadFileName}</span>
  <a href="javascript:void(0)" on:click={doView}>表示</a> |
  {#if $canScan}
  <a href="javascript:void(0)" on:click={doRescan}>再スキャン</a> |
  {/if}
  <a href="javascript:void(0)" on:click={doDelete}>削除</a>
</div>

<style>
  a:first-of-type {
    margin-left: 6px;
  }

  .icon {
    position: relative;
    top: 3px;
  }
</style>
