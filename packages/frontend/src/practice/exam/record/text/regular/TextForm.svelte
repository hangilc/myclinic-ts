<script lang="ts">
  import type * as m from "myclinic-model";
  import api from "@/lib/api";
  import { hasHikitsugi, extractHikitsugi } from "./hikitsugi";
  import { getCopyTarget } from "@/practice/exam/exam-vars";
  import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
  import TextCommandDialog from "./TextCommandDialog.svelte";
  import { listTextCommands } from "./text-commands";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { popupTrigger } from "@/lib/popup-helper";
  import { drawShohousen } from "@/lib/drawer/forms/shohousen/shohousen-drawer";
  import { dateToSqlDate, Visit } from "myclinic-model/model";
  import {
    confirmOnlinePresc,
    getFollowingText,
    isFaxToPharmacyText,
    isOnlineShohousen,
  } from "@/lib/shohousen-text-helper";
  import type { Shohousen2024Data } from "@/lib/drawer/forms/shohousen-2024/shohousenData2024";
  import { cache } from "@/lib/cache";
  import { parseShohou as parseShohouOld } from "@/lib/parse-shohou";
  import { parseShohou } from "@/lib/parse-shohou2";
  import { drawShohousen2024NoRefill } from "@/lib/drawer/forms/shohousen-2024/shohousenDrawer2024NoRefill";
  import { formatHokenshaBangou } from "myclinic-util";
  import {
    copyTextMemo,
    TextMemoWrapper,
    type ShohouTextMemo,
    type TextMemo,
  } from "@/lib/text-memo";
  import {
    eq公費レコード,
    type PrescInfoData,
    type 公費レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import { initPrescInfoData } from "@/lib/denshi-shohou/visit-shohou";
  import DenshiHenkanDialog from "./DenshiHenkanDialog.svelte";
  import type { ShohousenData2025 } from "@/lib/drawer/forms/shohousen-2025/data2025";
  import { drawShohousen2025 } from "@/lib/drawer/forms/shohousen-2025/drawShohousen2025";
  import { isKensa } from "./helper";
  import { PatientMemoWrapper } from "@/lib/patient-memo";
  import MailDialog from "@/lib/MailDialog.svelte";

  export let onClose: () => void;
  export let text: m.Text;
  export let index: number | undefined = undefined;
  export let patientId: number;

  let textarea: HTMLTextAreaElement;
  let memoKind: "shohou" | "shohou-conv" | undefined =
    TextMemoWrapper.fromText(text).getMemoKind();
  $: isKensaText = isKensa(patientId, text.content);

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

  async function isTodaysShohousen(): Promise<boolean> {
    const visit = await api.getVisit(text.visitId);
    const visitedAt = visit.visitedAt.substring(0, 10);
    const today = dateToSqlDate(new Date());
    return visitedAt === today;
  }

  async function doPrintShohousen() {
    if (!(await isTodaysShohousen())) {
      if (!confirm("本日の処方箋でありませんが、印刷しますか？")) {
        onClose();
        return;
      }
    }
    if (isOnlineShohousen(text.content)) {
      const follow = await getFollowingText(text);
      if (follow == null || !isFaxToPharmacyText(follow.content)) {
        const ok = confirm(
          "オンライン処方箋のようですが、送信先の薬局が指定されていません。\n" +
			"このまま印刷しますか？",
        );
        if (!ok) {
          return;
        }
      }
    }
    const clinicInfo = await api.getClinicInfo();
    const visitId = text.visitId;
    const hoken = await api.getHokenInfoForVisit(visitId);
    let hokenshaBangou: string | undefined = undefined;
    let hihokensha: string | undefined = undefined;
    let hokenKubun: "hihokensha" | "hifuyousha" | undefined = undefined;
    if (hoken.shahokokuho) {
      const shahokokuho = hoken.shahokokuho;
      hokenshaBangou = shahokokuho.hokenshaBangou.toString();
      hihokensha =
        shahokokuho.hihokenshaKigou + "・" + shahokokuho.hihokenshaBangou;
      hokenKubun = shahokokuho.honninStore === 0 ? "hifuyousha" : "hihokensha";
    } else if (hoken.koukikourei) {
      hokenshaBangou = hoken.koukikourei.hokenshaBangou;
      hihokensha = hoken.koukikourei.hihokenshaBangou;
    }
    let futansha: string | undefined = undefined;
    let jukyuusha: string | undefined = undefined;
    if (hoken.kouhiList.length >= 1) {
      const kouhi = hoken.kouhiList[0];
      futansha = kouhi.futansha.toString();
      jukyuusha = kouhi.jukyuusha.toString();
    }
    let futansha2: string | undefined = undefined;
    let jukyuusha2: string | undefined = undefined;
    if (hoken.kouhiList.length >= 2) {
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
      if (patient.sex === "M" || patient.sex === "F") {
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

  async function doPrintShohousen2024Old() {
    if (!(await isTodaysShohousen())) {
      if (!confirm("本日の処方箋でありませんが、印刷しますか？")) {
        onClose();
        return;
      }
    }
    const shohou = parseShohouOld(text.content, false);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    const clinicInfo = await cache.getClinicInfo();
    const visitId = text.visitId;
    const hoken = await api.getHokenInfoForVisit(visitId);
    let hokenshaBangou: string | undefined = undefined;
    let hihokenshaKigou = "";
    let hihokenshaBangou = "";
    let edaban = "";
    let hokenKubun: "hihokensha" | "hifuyousha" | undefined = undefined;
    if (hoken.shahokokuho) {
      const shahokokuho = hoken.shahokokuho;
      hokenshaBangou = formatHokenshaBangou(shahokokuho.hokenshaBangou);
      hihokenshaKigou = shahokokuho.hihokenshaKigou;
      hihokenshaBangou = shahokokuho.hihokenshaBangou;
      edaban = shahokokuho.edaban;
      hokenKubun = shahokokuho.honninStore !== 0 ? "hihokensha" : "hifuyousha";
    } else if (hoken.koukikourei) {
      hokenshaBangou = hoken.koukikourei.hokenshaBangou;
      hihokenshaBangou = hoken.koukikourei.hihokenshaBangou;
    }
    let futansha: string | undefined = undefined;
    let jukyuusha: string | undefined = undefined;
    if (hoken.kouhiList.length >= 1) {
      const kouhi = hoken.kouhiList[0];
      futansha = kouhi.futansha.toString();
      jukyuusha = kouhi.jukyuusha.toString();
    }
    let futansha2: string | undefined = undefined;
    let jukyuusha2: string | undefined = undefined;
    if (hoken.kouhiList.length >= 2) {
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
      if (patient.sex === "M" || patient.sex === "F") {
        sex = patient.sex;
      }
    }
    let koufuDate: string = dateToSqlDate(new Date());
    const data: Shohousen2024Data = {
      clinicAddress: clinicInfo.address,
      clinicName: clinicInfo.name,
      clinicPhone: `電話 ${clinicInfo.tel}`,
      clinicTodoufuken: clinicInfo.todoufukencode,
      clinicKikancode: clinicInfo.kikancode,
      doctorName: clinicInfo.doctorName,
      hokenshaBangou,
      hihokenshaKigou,
      hihokenshaBangou,
      edaban,
      futansha,
      jukyuusha,
      futansha2,
      jukyuusha2,
      shimei,
      birthdate,
      sex,
      hokenKubun,
      koufuDate,
      drugs: shohou,
    };
    const pages = drawShohousen2024NoRefill(data);
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
    onClose();
  }

  async function doPrintShohousen2024() {
    if (!(await isTodaysShohousen())) {
      if (!confirm("本日の処方箋でありませんが、印刷しますか？")) {
        onClose();
        return;
      }
    }
    const shohou = parseShohou(text.content);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    const clinicInfo = await cache.getClinicInfo();
    const visitId = text.visitId;
    const hoken = await api.getHokenInfoForVisit(visitId);
    let hokenshaBangou: string | undefined = undefined;
    let hihokenshaKigou = "";
    let hihokenshaBangou = "";
    let edaban = "";
    let hokenKubun: "hihokensha" | "hifuyousha" | undefined = undefined;
    if (hoken.shahokokuho) {
      const shahokokuho = hoken.shahokokuho;
      hokenshaBangou = formatHokenshaBangou(shahokokuho.hokenshaBangou);
      hihokenshaKigou = shahokokuho.hihokenshaKigou;
      hihokenshaBangou = shahokokuho.hihokenshaBangou;
      edaban = shahokokuho.edaban;
      hokenKubun = shahokokuho.honninStore !== 0 ? "hihokensha" : "hifuyousha";
    } else if (hoken.koukikourei) {
      hokenshaBangou = hoken.koukikourei.hokenshaBangou;
      hihokenshaBangou = hoken.koukikourei.hihokenshaBangou;
    }
    let futansha: string | undefined = undefined;
    let jukyuusha: string | undefined = undefined;
    if (hoken.kouhiList.length >= 1) {
      const kouhi = hoken.kouhiList[0];
      futansha = kouhi.futansha.toString();
      jukyuusha = kouhi.jukyuusha.toString();
    }
    let futansha2: string | undefined = undefined;
    let jukyuusha2: string | undefined = undefined;
    if (hoken.kouhiList.length >= 2) {
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
      if (patient.sex === "M" || patient.sex === "F") {
        sex = patient.sex;
      }
    }
    let koufuDate: string = dateToSqlDate(new Date());
    const data: Shohousen2024Data = {
      clinicAddress: clinicInfo.address,
      clinicName: clinicInfo.name,
      clinicPhone: `電話 ${clinicInfo.tel}`,
      clinicTodoufuken: clinicInfo.todoufukencode,
      clinicKikancode: clinicInfo.kikancode,
      doctorName: clinicInfo.doctorName,
      hokenshaBangou,
      hihokenshaKigou,
      hihokenshaBangou,
      edaban,
      futansha,
      jukyuusha,
      futansha2,
      jukyuusha2,
      shimei,
      birthdate,
      sex,
      hokenKubun,
      koufuDate,
      drugs: shohou,
    };
    const pages = drawShohousen2024NoRefill(data);
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
    onClose();
  }

  async function prepareData(): Promise<ShohousenData2025> {
    const clinicInfo = await cache.getClinicInfo();
    const visitId = text.visitId;
    const hoken = await api.getHokenInfoForVisit(visitId);
    let hokenshaBangou: string | undefined = undefined;
    let hihokenshaKigou = "";
    let hihokenshaBangou = "";
    let edaban = "";
    let hokenKubun: "hihokensha" | "hifuyousha" | undefined = undefined;
    if (hoken.shahokokuho) {
      const shahokokuho = hoken.shahokokuho;
      hokenshaBangou = formatHokenshaBangou(shahokokuho.hokenshaBangou);
      hihokenshaKigou = shahokokuho.hihokenshaKigou;
      hihokenshaBangou = shahokokuho.hihokenshaBangou;
      edaban = shahokokuho.edaban;
      hokenKubun = shahokokuho.honninStore !== 0 ? "hihokensha" : "hifuyousha";
    } else if (hoken.koukikourei) {
      hokenshaBangou = hoken.koukikourei.hokenshaBangou;
      hihokenshaBangou = hoken.koukikourei.hihokenshaBangou;
    }
    let futansha: string | undefined = undefined;
    let jukyuusha: string | undefined = undefined;
    if (hoken.kouhiList.length >= 1) {
      const kouhi = hoken.kouhiList[0];
      futansha = kouhi.futansha.toString();
      jukyuusha = kouhi.jukyuusha.toString();
    }
    let futansha2: string | undefined = undefined;
    let jukyuusha2: string | undefined = undefined;
    if (hoken.kouhiList.length >= 2) {
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
      if (patient.sex === "M" || patient.sex === "F") {
        sex = patient.sex;
      }
    }
    let koufuDate: string = dateToSqlDate(new Date());
    const data: ShohousenData2025 = {
      clinicAddress: clinicInfo.address,
      clinicName: clinicInfo.name,
      clinicPhone: `電話 ${clinicInfo.tel}`,
      clinicTodoufuken: clinicInfo.todoufukencode,
      clinicKikancode: clinicInfo.kikancode,
      doctorName: clinicInfo.doctorName,
      hokenshaBangou,
      hihokenshaKigou,
      hihokenshaBangou,
      edaban,
      futansha,
      jukyuusha,
      futansha2,
      jukyuusha2,
      shimei,
      birthdate,
      sex,
      hokenKubun,
      koufuDate,
    };
    return data;
  }

  async function doPrintShohousen2025() {
    if (!(await isTodaysShohousen())) {
      if (!confirm("本日の処方箋でありませんが、印刷しますか？")) {
        onClose();
        return;
      }
    }
    const shohou = parseShohou(text.content);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    let data: ShohousenData2025 = await prepareData();
    data.shohou = shohou;
    let pages = drawShohousen2025(data);
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
    onClose();
  }

  function doFormatShohousen(): void {
    textarea.value = parseShohousen(textarea.value.trim()).formatForSave();
  }

  function checkKouhiCompat(
    src: PrescInfoData,
    dst: PrescInfoData,
  ): string | undefined {
    function compat(
      a: 公費レコード | undefined,
      b: 公費レコード | undefined,
    ): boolean {
      if (a && b) {
        return eq公費レコード(a, b);
      } else {
        return a === b;
      }
    }
    if (!compat(src.第一公費レコード, dst.第一公費レコード)) {
      return "第一公費レコードが一致しません。";
    }
    if (!compat(src.第二公費レコード, dst.第二公費レコード)) {
      return "第二公費レコードが一致しません。";
    }
    if (!compat(src.第三公費レコード, dst.第三公費レコード)) {
      return "第三公費レコードが一致しません。";
    }
    if (!compat(src.特殊公費レコード, dst.特殊公費レコード)) {
      return "特殊公費レコードが一致しません。";
    }
    return undefined;
  }

  function checkMemoCompat(
    src: TextMemo | undefined,
    dst: TextMemo | undefined,
  ): string | undefined {
    if (src === undefined && dst === undefined) {
      return undefined;
    } else if (src && dst) {
      if (src.kind === "shohou" && dst.kind === src.kind) {
        return checkKouhiCompat(src.shohou, dst.shohou);
      } else if (src.kind === "shohou-conv" && dst.kind === src.kind) {
        return checkKouhiCompat(src.shohou, dst.shohou);
      } else {
      }
    }
    return "inconsistent text memo";
  }

  async function onCopy() {
    const targetVisitId = getCopyTarget();
    if (targetVisitId !== null) {
      const t: m.Text = Object.assign({}, text, {
        textId: 0,
        visitId: targetVisitId,
      });
      const curMemo = TextMemoWrapper.fromText(text).getMemo();
      const newMemo = await copyTextMemo(curMemo, targetVisitId);
      const warn = checkMemoCompat(curMemo, newMemo);
      if (typeof warn === "string") {
        alert(`警告：${warn}`);
      }
      TextMemoWrapper.setTextMemo(t, newMemo);
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

  function kouhiCountOfVisit(visit: Visit): number {
    let count = 0;
    if (visit.kouhi1Id > 0) {
      count += 1;
    } else {
      if (visit.kouhi2Id > 0) {
        throw new Error("invalid kouhi allocation");
      }
      if (visit.kouhi3Id > 0) {
        throw new Error("invalid kouhi allocation");
      }
      return count;
    }
    if (visit.kouhi2Id > 0) {
      count += 1;
    } else {
      if (visit.kouhi3Id > 0) {
        throw new Error("invalid kouhi allocation");
      }
      return count;
    }
    if (visit.kouhi3Id > 0) {
      count += 1;
    }
    return count;
  }

  async function doShohouConv() {
    const parsed = parseShohousen(text.content);
    const visit = await api.getVisit(text.visitId);
    const patient = await api.getPatient(visit.patientId);
    const hoken = await api.getHokenInfoForVisit(visit.visitId);
    const clinicInfo = await cache.getClinicInfo();
    // const kouhiCount = kouhiCountOfVisit(visit);
    const template = initPrescInfoData(visit, patient, hoken, clinicInfo);
    const d: DenshiHenkanDialog = new DenshiHenkanDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        init: { kind: "parsed", shohousen: parsed, template },
        at: visit.visitedAt.substring(0, 10),
        kouhiList: hoken.kouhiList,
        onEnter: async (arg: PrescInfoData) => {
          console.log("arg", arg);
          TextMemoWrapper.setTextMemo(text, {
            kind: "shohou-conv",
            shohou: arg,
          });
          onClose();
          await api.updateText(text);
        },
        onCancel: onClose,
      },
    });
  }

  async function doEditShohouConv() {
    const memo = TextMemoWrapper.fromText(text).probeShohouConvMemo();
    if (memo) {
      const visit = await api.getVisit(text.visitId);
      const shohou = memo.shohou;
      const hoken = await api.getHokenInfoForVisit(visit.visitId);
      // const kouhiCount = kouhiCountOfVisit(visit);
      const d: DenshiHenkanDialog = new DenshiHenkanDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          init: { kind: "denshi", data: shohou },
          at: visit.visitedAt.substring(0, 10),
          kouhiList: hoken.kouhiList,
          onEnter: async (arg: PrescInfoData) => {
            TextMemoWrapper.setTextMemo(text, {
              kind: "shohou-conv",
              shohou: arg,
            });
            onClose();
            await api.updateText(text);
          },
          onCancel: onClose,
        },
      });
    }
  }

  async function doTransformToDenshi() {
    const memo = TextMemoWrapper.fromText(text).probeShohouConvMemo();
    if (memo) {
      const newMemo: ShohouTextMemo = {
        kind: "shohou",
        shohou: memo.shohou,
        prescriptionId: undefined,
      };
      TextMemoWrapper.setTextMemo(text, newMemo);
      onClose();
      await api.updateText(text);
    }
  }

  function oldShohouPopup(): [string, () => void][] {
    const menu: [string, () => void][] = [
      ["処方箋印刷", doPrintShohousen],
      ["処方箋2024印刷（旧）", doPrintShohousen2024Old],
      ["処方箋2024印刷", doPrintShohousen2025],
      ["処方箋フォーマット", doFormatShohousen],
    ];
    if (memoKind === undefined) {
      menu.push(["電子予備作成", doShohouConv]);
    } else if (memoKind === "shohou-conv") {
      menu.push(["電子予備編集", doEditShohouConv]);
      menu.push(["電子処方に", doTransformToDenshi]);
    }
    return menu;
  }

  async function doMail() {
	const patient = await api.getPatient(patientId);
	let memoWrapper = new PatientMemoWrapper(patient.memo);
	let addr = memoWrapper.getEmail();
	if( !addr ){
	  alert("No email address");
	  return;
	}
	let from = await cache.getDoctorEmail();
	if( from === "" ){
	  alert("Doctor email is not configured.");
	  return;
	}
	let d: MailDialog = new MailDialog({
	  target: document.body,
	  props: {
		destroy: () => d.$destroy(),
		to: addr,
		from,
		subject: "検査結果",
		content: "血液検査の結果です",
	  }
	})
	// let ok = await api.sendmail({
	//   "to": addr,
	//   "from": "hangil@changclinic.com",
	//   "subject": "検査結果",
	//   "content": "テスト",
	// })
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
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
      {#if isShohousen(text.content)}
        <a href="javascript:void(0)" on:click={popupTrigger(oldShohouPopup)}
          >処方箋</a
        >
      {/if}
	  {#if isKensaText}
		<a href="javascript:void(0)" on:click={doMail}>メール送信</a>
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
