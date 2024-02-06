<script lang="ts">
  import type * as m from "myclinic-model";
  import api from "@/lib/api";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { hasHikitsugi, extractHikitsugi } from "./hikitsugi";
  import { getCopyTarget } from "../../exam-vars";
  import { parseShohousen } from "@/lib/shohousen/parse-shohousen";
  import TextCommandDialog from "./TextCommandDialog.svelte";
  import { listTextCommands } from "./text-commands";
  import { confirm } from "@/lib/confirm-call";
  import ShohousenDrawerDialog from "@/ShohousenDrawerDialog.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { popupTrigger } from "@/lib/popup-helper";
  import { drawShohousen } from "@/lib/drawer/forms/shohousen/shohousen-drawer";

  export let onClose: () => void;
  export let text: m.Text;
  export let index: number | undefined = undefined;
  let textarea: HTMLTextAreaElement;

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

  function onDelete(): void {
    confirm("この文章を削除していいですか？", () =>
      api.deleteText(text.textId)
    );
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
    const clinicInfo = await api.getClinicInfo();
    const ops = drawShohousen({
      clinicAddress: clinicInfo.address,
      clinicName: clinicInfo.name,
      clinicPhone: `電話 ${clinicInfo.tel}`,
      clinicKikancode: clinicInfo.kikancode,
      doctorName: clinicInfo.doctorName,
      hokenshaBangou: "1234567",
      hihokensha: "チナフ・234",
      futansha: "12345678",
      jukyuusha: "7654321",
      futansha2: "23456789",
      jukyuusha2: "6543210",
      shimei: "田中隆",
      birthdate: "1957-06-12",
      sex: "M",
      hokenKubun: "hifuyousha",
      koufuDate: "2024-01-23",
      validUptoDate: "2024-01-30",
      drugs: "院外処方\nＲｐ）\n１）カロナール錠５００ｍｇ　３錠\n　　分３　毎食後　５日分",
    });
    const d: ShohousenDrawerDialog = new ShohousenDrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
      },
    });
    onClose();
  }

  function doFormatShohousen(): void {
    textarea.value = parseShohousen(textarea.value.trim()).formatForSave();
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

<div>
  <textarea bind:this={textarea} on:keydown={doKeyDown} use:setFocus
    >{text.content}</textarea
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
            on:click={popupTrigger(() => [
              ["処方箋印刷", doPrintShohousen],
              ["処方箋フォーマット", doFormatShohousen],
            ])}>処方箋</a
          >
      {/if}
      <a href="javascript:void(0)" on:click={onDelete}>削除</a>
      <a href="javascript:void(0)" on:click={onCopy}>コピー</a>
    </div>
  {/if}
</div>

<style>
  textarea {
    width: 100%;
    height: 16em;
    resize: vertical;
    box-sizing: border-box;
  }
</style>
