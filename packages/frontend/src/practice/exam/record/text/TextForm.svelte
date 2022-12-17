<script lang="ts">
  import type * as m from "myclinic-model";
  import api from "@/lib/api";
  import Confirm from "@/lib/Confirm.svelte";
  import type { Op } from "@/lib/drawer/op";
  import ShohousenDrawer from "@/ShohousenDrawerDialog.svelte";
  import { hasHikitsugi, extractHikitsugi } from "./hikitsugi";
  import { getCopyTarget } from "../../ExamVars";
  import Pulldown from "@/lib/Pulldown.svelte";
  import { parseShohousen } from "@/lib/shohousen/parse-shohousen";
  import TextCommandDialog from "./TextCommandDialog.svelte";
  import { listTextCommands } from "./text-commands";

  export let onClose: () => void;
  export let text: m.Text;
  export let index: number | undefined = undefined;
  let textarea: HTMLTextAreaElement;
  let drawerDialog: ShohousenDrawer;
  let shohousenAnchor: HTMLElement;
  let shohousenPulldown: Pulldown;

  function onEnter(): void {
    const content = textarea.value.trim();
    const newText: m.Text = Object.assign({}, text, { content });
    if (newText.textId === 0) {
      api.enterText(newText);
      onClose();
    } else {
      api.updateText(newText);
      onClose();
    }
  }

  let confirmDeleteDialog: Confirm;

  function onDelete(): void {
    confirmDeleteDialog.confirm(() => api.deleteText(text.textId));
  }

  function containsHikitsugi(): boolean {
    return index === 0 && hasHikitsugi(text.content);
  }

  function doHikitsugi(): void {
    const targetVisitId = getCopyTarget();
    if (targetVisitId !== null) {
      const s: string = extractHikitsugi(text.content);
      const t: m.Text = {
        textId: 0,
        visitId: targetVisitId,
        content: s,
      };
      api.enterText(t);
      onClose();
    } else {
      alert("コピー先を見つけられませんでした。");
    }
  }

  function isShohousen(): boolean {
    return text.content.startsWith("院外処方\nＲｐ）");
  }

  let ops: Op[] = [];

  async function doPrintShohousen() {
    ops = await api.shohousenDrawer(text.textId);
    drawerDialog.open();
  }

  function doFormatShohousen(): void {
    textarea.value = parseShohousen(textarea.value.trim()).formatForSave();
  }

  function onShohousen(): void {
    shohousenPulldown.open();
  }

  async function onCopy() {
    const targetVisitId = getCopyTarget();
    if (targetVisitId !== null) {
      const t: m.Text = Object.assign({}, text, {
        textId: 0,
        visitId: targetVisitId,
      });
      api.enterText(t);
      onClose();
    } else {
      alert("コピー先を見つけられませんでした。");
    }
  }

  function doKeyDown(event: KeyboardEvent): void {
    if (event.altKey && event.key === "p") {
      const d: TextCommandDialog = new TextCommandDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          commands: listTextCommands(),
          onEnter: (t: string) => {
            let ta = event.target as HTMLTextAreaElement;
            ta.setRangeText(t, ta.selectionStart, ta.selectionEnd, "end");
            ta.focus();
          },
        },
      });
    }
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <textarea bind:this={textarea} on:keydown={doKeyDown}>{text.content}</textarea
  >
  {#if text.textId === 0}
    <div>
      <button on:click={onEnter}>入力</button>
      <button on:click={onClose}>キャンセル</button>
    </div>
  {:else}
    <div>
      <a href="javascript:void(0)" on:click={onEnter}>入力</a>
      <a href="javascript:void(0)" on:click={onClose}>キャンセル</a>
      {#if containsHikitsugi()}
        <a href="javascript:void(0)" on:click={() => doHikitsugi()}
          >引継ぎコピー</a
        >
      {/if}
      {#if isShohousen()}
        <a
          href="javascript:void(0)"
          bind:this={shohousenAnchor}
          on:click={onShohousen}>処方箋</a
        >
      {/if}
      <a href="javascript:void(0)" on:click={onDelete}>削除</a>
      <a href="javascript:void(0)" on:click={onCopy}>コピー</a>
    </div>
  {/if}
</div>

<ShohousenDrawer bind:this={drawerDialog} {ops} {onClose} />

<Pulldown anchor={shohousenAnchor} bind:this={shohousenPulldown}>
  <svelte:fragment>
    <a href="javascript:void(0)" on:click={doPrintShohousen}>処方箋印刷</a>
    <a href="javascript:void(0)" on:click={doFormatShohousen}
      >処方箋フォーマット</a
    >
  </svelte:fragment>
</Pulldown>
<Confirm
  bind:this={confirmDeleteDialog}
  text="この文章を削除していいですか？"
/>

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
    box-sizing: border-box;
  }
</style>
