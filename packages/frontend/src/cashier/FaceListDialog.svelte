<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
  import {
    onshiFace,
    onshiFaceArchive,
    type OnshiFaceConfirmed,
  } from "@/lib/onshi-face";
  import { hotlineTrigger } from "@/lib/event-emitter";
  import { DateWrapper } from "myclinic-util";

  export let destroy: () => void;
  export let list: OnshiFaceConfirmed[];

  function onshiDateTimeRep(onshiDateTime: string): string {
    return DateWrapper.from(onshiDateTime).render(
      (d) =>
        `${d.gengou}${d.nen}年${d.month}月${d.day}日 ${d.getHours()}時${d.getMinutes()}分`
    );
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
      },
    });
  }
</script>

<Dialog title="顔認証一覧" {destroy} styleWidth="360px">
  {#if list.length > 0}
    {#each list as c (c.fileName)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
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
