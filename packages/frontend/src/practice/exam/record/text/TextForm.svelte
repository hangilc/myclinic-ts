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
  import { confirmOnlinePresc, isFaxToPharmacyText, isOnlineShohousen } from "./shohousen-text-helper";

  export let onClose: () => void;
  export let text: m.Text;
  export let index: number | undefined = undefined;
  let textarea: HTMLTextAreaElement;

  async function onEnter() {
    const content = textarea.value.trim();
    if( isOnlineShohousen(content) ){
      
    }
    if( isFaxToPharmacyText(content) ) {
      const err = await confirmOnlinePresc(text);
      if( err ){
        const proceed = confirm(`${err}\nこのまま入力しますか？`);
        if( !proceed ){
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
    if( confirm("この文章を削除していいですか？") ) {
      api.deleteText(text.textId)
    }
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

  async function isTodaysShohousen(): Promise<boolean> {
    const visit = await api.getVisit(text.visitId);
    const visitedAt = visit.visitedAt.substring(0, 10);
    const today = dateToSqlDate(new Date());
    return visitedAt === today;
  }

  async function doPrintShohousen() {
    if( !(await isTodaysShohousen()) ){
      if( !confirm("本日の処方線でありませんが、印刷しますか？") ){
        onClose();
        return;
      }
    }
    const clinicInfo = await api.getClinicInfo();
    const visitId = text.visitId;
    const hoken = await api.getHokenInfoForVisit(visitId);
    let hokenshaBangou: string | undefined = undefined;
    let hihokensha: string | undefined = undefined;
    let hokenKubun: "hihokensha" | "hifuyousha" | undefined = undefined;
    if( hoken.shahokokuho ){
      const shahokokuho = hoken.shahokokuho;
      hokenshaBangou = shahokokuho.hokenshaBangou.toString();
      hihokensha = shahokokuho.hihokenshaKigou + "・" + shahokokuho.hihokenshaBangou;
      hokenKubun = shahokokuho.honninStore === 0 ? "hifuyousha" : "hihokensha";
    } else if( hoken.koukikourei ){
      hokenshaBangou = hoken.koukikourei.hokenshaBangou;
      hihokensha = hoken.koukikourei.hihokenshaBangou;
    }
    let futansha: string | undefined = undefined;
    let jukyuusha: string | undefined = undefined;
    if( hoken.kouhiList.length >= 1 ){
      const kouhi = hoken.kouhiList[0];
      futansha = kouhi.futansha.toString();
      jukyuusha = kouhi.jukyuusha.toString();
    }
    let futansha2: string | undefined = undefined;
    let jukyuusha2: string | undefined = undefined;
    if( hoken.kouhiList.length >= 2 ){
      const kouhi = hoken.kouhiList[1];
      futansha2 = kouhi.futansha.toString();
      jukyuusha2 = kouhi.jukyuusha.toString();
    }
    let shimei: string | undefined = undefined;
    let birthdate: string | undefined = undefined;
    let sex: "M" | "F" | undefined = undefined;
    {
      const visit = await api.getVisit(text.visitId);
      const patient = await api.getPatient(visit.patientId);
      shimei = `${patient.lastName}${patient.firstName}`;
      birthdate = patient.birthday;
      if( patient.sex === "M" || patient.sex === "F" ){
        sex = patient.sex;
      }
    }
    let koufuDate: string = dateToSqlDate(new Date());
    const ops = drawShohousen({
      clinicAddress: clinicInfo.address,
      clinicName: clinicInfo.name,
      clinicPhone: `電話 ${clinicInfo.tel}`,
      clinicKikancode: clinicInfo.kikancode,
      doctorName: clinicInfo.doctorName,
      hokenshaBangou,
      hihokensha,
      futansha,
      jukyuusha,
      futansha2,
      jukyuusha2,
      shimei,
      birthdate,
      sex,
      hokenKubun,
      koufuDate,
      validUptoDate: undefined,
      drugs: text.content,
    });
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        width: 148,
        height: 210,
        scale: 3,
        kind: "shohousen",
        title: "処方箋印刷",
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
