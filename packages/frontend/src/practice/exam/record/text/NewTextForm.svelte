<script lang="ts">
  import type * as m from "myclinic-model";
  import api from "@/lib/api";
  import { hasHikitsugi, extractHikitsugi } from "./hikitsugi";
  import { getCopyTarget } from "../../exam-vars";
  import { parseShohousen } from "@/lib/shohousen/parse-shohousen";
  import TextCommandDialog from "./TextCommandDialog.svelte";
  import { listTextCommands } from "./text-commands";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { popupTrigger } from "@/lib/popup-helper";
  import { drawShohousen } from "@/lib/drawer/forms/shohousen/shohousen-drawer";
  import { dateToSqlDate } from "myclinic-model/model";
  import {
    confirmOnlinePresc,
    getFollowingText,
    isFaxToPharmacyText,
    isOnlineShohousen,
  } from "@/lib/shohousen-text-helper";

  export let onClose: () => void;
  export let visitId: number;
  let text: m.Text = { textId: 0, visitId, content: "" };
  let textarea: HTMLTextAreaElement;

  async function onEnter() {
    const content = textarea.value.trim();
    if (isFaxToPharmacyText(content)) {
      const err = await confirmOnlinePresc(text);
      if (err) {
        const proceed = confirm(`${err}\nこのまま入力しますか？`);
        if (!proceed) {
          return;
        }
      }
    }
    const newText: m.Text = Object.assign({}, text, { content });
    if (newText.textId === 0) {
      api.enterText(newText);
      onClose();
    } else {
      api.updateText(newText);
      onClose();
    }
  }

  function onDelete(): void {
    if (confirm("この文章を削除していいですか？")) {
      api.deleteText(text.textId);
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

<div>
  <textarea bind:this={textarea} on:keydown={doKeyDown} use:setFocus
    >{text.content}</textarea
  >
  <div>
    <button on:click={onEnter}>入力</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</div>

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
    box-sizing: border-box;
  }
</style>
