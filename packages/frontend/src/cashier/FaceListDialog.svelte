<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
  import { onshiFace, onshiFaceArchive, type OnshiFaceConfirmed } from "@/lib/onshi-face";
  import * as kanjidate from "kanjidate";
  import { hotlineTrigger } from "@/reception/reception-vars";

  export let destroy: () => void;
  export let list: OnshiFaceConfirmed[];

  function onshiDateTimeRep(onshiDateTime: string): string {
    return kanjidate.format("{G}{N}年{M}月{D}日 {h}時{m}分", onshiDateTime);
  }

  async function doSelect(c: OnshiFaceConfirmed) {
    const result = await onshiFace(c.fileName);
    const d: FaceConfirmedWindow = new FaceConfirmedWindow({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        result,
        onRegister: async () => {
          await onshiFaceArchive(c.fileName);
          destroy();
        },
        hotlineTrigger,
      }
    })
  }
</script>

<Dialog title="顔認証一覧" {destroy} styleWidth="360px">
  {#if list.length > 0}
    {#each list as c (c.fileName)}
      <div class="item" on:click={() => doSelect(c)}>
        <span>{c.name}</span>
        <span>{onshiDateTimeRep(c.createdAt)}</span>
      </div>
    {/each}
  {:else}
    （確認済の顔認証なし）
  {/if}
</Dialog>

<style>
  .item {
    cursor: pointer;
  }
</style>
