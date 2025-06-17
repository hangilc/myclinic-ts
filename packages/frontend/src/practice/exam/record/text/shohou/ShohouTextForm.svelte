<script lang="ts">
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import {
    createPrescInfo,
    type PrescInfoData,
  } from "@/lib/denshi-shohou/presc-info";
  import DenshiHenkanDialog from "../regular/DenshiHenkanDialog.svelte";
  import type { Kouhi } from "myclinic-model";
  import { denshiToPrint, denshiToPrint2 } from "./denshi-to-print";
  import { drawShohousen2024NoRefill } from "@/lib/drawer/forms/shohousen-2024/shohousenDrawer2024NoRefill";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import ShowCodeDialog from "@/lib/denshi-shohou/ShowCodeDialog.svelte";
  import { sign_presc } from "@/lib/hpki-api";
  import { cache } from "@/lib/cache";
  import {
    registerPresc,
    shohouHikae,
    shohouHikaeFilename,
  } from "@/lib/denshi-shohou/presc-api";
  import {
    checkShohouResult,
    type HikaeResult,
    type RegisterResult,
  } from "@/lib/denshi-shohou/shohou-interface";
  import api from "@/lib/api";
  import { getCopyTarget } from "@/practice/exam/exam-vars";
  import { Text } from "myclinic-model";
  import {
    checkMemoCompat,
    copyTextMemo,
    TextMemoWrapper,
    type ShohouTextMemo,
  } from "@/lib/text-memo";
  import { denshiToOldShohou } from "./denshi-to-old-shohou";
  import { drawShohousen2025 } from "@/lib/drawer/forms/shohousen-2025/drawShohousen2025";
  import DenshiEditor from "@/lib/denshi-editor/DenshiEditor.svelte";

  export let shohou: PrescInfoData;
  export let at: string;
  export let kouhiList: Kouhi[];
  export let textId: number;
  export let onCancel: () => void;
  export let onDone: () => void;
  export let onModified: (newShohou: PrescInfoData) => void;
  export let onRegistered: (
    shohou: PrescInfoData,
    prescriptionId: string,
  ) => void;
  export let onCopied: () => void;

  function doEdit() {
    const d: DenshiEditor = new DenshiEditor({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        data: shohou,
        onEnter: (updated: PrescInfoData) => {
          onModified(updated);
        },
      },
    });
  }

  function doOldEdit() {
    const d: DenshiHenkanDialog = new DenshiHenkanDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        init: { kind: "denshi", data: shohou },
        at,
        kouhiList,
        title: "処方編集",
        onEnter: (newShohou: PrescInfoData) => {
          onModified(newShohou);
        },
        onCancel: () => {
          onCancel();
        },
      },
    });
  }

  function doPrint() {
    const data = denshiToPrint(shohou);
    const pages = drawShohousen2024NoRefill(data);
    onDone();
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        pages,
        width: 148,
        height: 210,
        scale: 3,
        kind: "shohousen2024",
        title: "処方箋印刷",
      },
    });
  }

  function doPrint2() {
    const data = denshiToPrint2(shohou);
    const pages = drawShohousen2025(data);
    onDone();
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        pages,
        width: 148,
        height: 210,
        scale: 3,
        kind: "shohousen2024",
        title: "処方箋印刷",
      },
    });
  }

  function doCode() {
    const code: string = createPrescInfo(shohou);
    const d: ShowCodeDialog = new ShowCodeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        code,
      },
    });
  }

  async function saveHikae(kikancode: string, prescriptionId: string) {
    let resultString = await shohouHikae(kikancode, prescriptionId);
    let result: HikaeResult = JSON.parse(resultString);
    let err = checkShohouResult(result);
    if (err) {
      alert(err);
      return;
    }
    let base64 = result.XmlMsg.MessageBody.PrescriptionReferenceInformationFile;
    let filename = shohouHikaeFilename(prescriptionId);
    await api.decodeBase64ToFile(filename, base64);
  }

  async function doRegister() {
    if (shohou.引換番号) {
      alert("既に登録されています。");
      return;
    }
    const prescInfo = createPrescInfo(shohou);
    const signed = await sign_presc(prescInfo);
    const kikancode = await cache.getShohouKikancode();
    let result = await registerPresc(signed, kikancode, "1");
    let register: RegisterResult = JSON.parse(result);
    if (register.XmlMsg.MessageBody?.CsvCheckResultList) {
      let list = register.XmlMsg.MessageBody?.CsvCheckResultList;
      if (list.length > 0) {
        let ms = list.map((item) => item.ResultMessage).join("\n");
        alert(ms);
      }
    }
    shohou = Object.assign({}, shohou, {
      引換番号: register.XmlMsg.MessageBody?.AccessCode,
    });
    const prescriptionId = register.XmlMsg.MessageBody?.PrescriptionId;
    if (prescriptionId == undefined) {
      throw new Error("undefined prescriptionId");
    }
    saveHikae(kikancode, prescriptionId);
    onRegistered(shohou, prescriptionId);
  }

  async function doDelete() {
    if (confirm("この処方を削除していいですか？")) {
      await api.deleteText(textId);
    }
  }

  async function doCopy() {
    const targetVisitId = getCopyTarget();
    if (targetVisitId !== null) {
      const t: Text = { textId: 0, visitId: targetVisitId, content: "" };
      const curMemo: ShohouTextMemo = {
        kind: "shohou",
        shohou,
        prescriptionId: undefined,
      };
      const newMemo = await copyTextMemo(curMemo, targetVisitId);
      const warn = checkMemoCompat(curMemo, newMemo);
      if (typeof warn === "string") {
        alert(`警告：${warn}`);
      }
      TextMemoWrapper.setTextMemo(t, newMemo);
      api.enterText(t);
      onCopied();
    } else {
      alert("コピー先を見つけられませんでした。");
    }
  }

  async function doOldShohou() {
    let c = denshiToOldShohou(shohou);
    const visitId = (await api.getText(textId)).visitId;
    const text = { textId: 0, visitId, content: c };
    onDone();
    await api.enterText(text);
  }
</script>

<div style="border:1px solid green;padding:10px;border-radius:6px">
  <DenshiShohouDisp {shohou} prescriptionId={undefined} />
</div>
<!-- svelte-ignore a11y-invalid-attribute -->
<div style="margin-top:6px;">
  <a href="javascript:void(0)" on:click={doRegister}>登録</a>
  <a href="javascript:void(0)" on:click={doEdit}>編集</a>
  <a href="javascript:void(0)" on:click={doOldEdit}>編集（旧）</a>
  <a href="javascript:void(0)" on:click={doPrint2}>印刷</a>
  <a href="javascript:void(0)" on:click={doPrint}>印刷（旧）</a>
  <a href="javascript:void(0)" on:click={doCode}>コード</a>
  <a href="javascript:void(0)" on:click={doDelete}>削除</a>
  <a href="javascript:void(0)" on:click={doCopy}>コピー</a>
  <a href="javascript:void(0)" on:click={doOldShohou}>旧処方に</a>
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
