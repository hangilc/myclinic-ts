<script lang="ts">
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import {
    mkRyouyouKeikakushoData,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo, Patient } from "myclinic-model";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import { createInputs } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import ChevronUp from "@/icons/ChevronUp.svelte";
  import { DateWrapper, calcAge } from "myclinic-util";
  import { sqlDateToDate } from "@/lib/date-util";
  import {
    effectiveFormDataOf,
    indexOfLastFormData,
    mkFormData,
    updateByPartial,
    type FormData,
  } from "./form-data";
  import { getRyouyouKeikakushoMasterText } from "./helper";

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let formData: FormData = mkFormData();
  let clinicInfo: ClinicInfo | undefined = undefined;
  let stores: { id: number; formData: Partial<FormData> }[] = [];
  let storesId = -1;
  let storesAreaVisible = false;

  let serialStoreId = 0;

  function adaptShokujiChecks() {
    if (!formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"]) {
      formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"] =
        formData.immediates["juuten-食事-外食の際の注意事項"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-節酒-mark"]) {
      formData.shokujiChecks["juuten-食事-節酒-mark"] =
        formData.immediates["juuten-食事-節酒"] !== "" ||
        formData.immediates["juuten-食事-節酒-回"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-間食-mark"]) {
      formData.shokujiChecks["juuten-食事-間食-mark"] =
        formData.immediates["juuten-食事-間食"] !== "" ||
        formData.immediates["juuten-食事-間食-回"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-食べ方-mark"]) {
      formData.shokujiChecks["juuten-食事-食べ方-mark"] =
        formData.shokujiYukkuri ||
        formData.immediates["juuten-食事-食べ方"] !== "";
    }
    if (!formData.shokujiCheck) {
      formData.shokujiCheck = Object.values(formData.shokujiChecks).some(
        (checked) => checked,
      );
    }
  }

  function adaptUndouChecks() {
    if (!formData.undouChecks["juuten-運動-種類-mark"]) {
      formData.undouChecks["juuten-運動-種類-mark"] =
        formData.undouWalking ||
        formData.immediates["juuten-運動-種類"] !== "" ||
        formData.immediates["juuten-運動-時間"] !== "" ||
        formData.undouEveryDay ||
        formData.immediates["juuten-運動-頻度"] !== "" ||
        formData.undouIntensityBreath ||
        formData.immediates["juuten-運動-強度-脈拍"] !== "" ||
        formData.immediates["juuten-運動-強度-その他"] !== "";
    }
    if (!formData.undouChecks["juuten-運動-活動量-mark"]) {
      formData.undouChecks["juuten-運動-活動量-mark"] =
        formData.undouChecks["juuten-運動-活動量-mark"] ||
        formData.immediates["juuten-運動-活動量"] !== "";
    }
    if (!formData.undouChecks["juuten-運動-注意事項-mark"]) {
      formData.undouChecks["juuten-運動-注意事項-mark"] =
        formData.undouChecks["juuten-運動-注意事項-mark"] ||
        formData.immediates["juuten-運動-注意事項"] !== "";
    }
    if (!formData.undouCheck) {
      formData.undouCheck = Object.values(formData.undouChecks).some(
        (checked) => checked,
      );
    }
  }

  function adaptTabakoChecks() {
    if (!formData.undouChecks["juuten-運動-注意事項-mark"]) {
      formData.undouChecks["juuten-運動-注意事項-mark"] =
        formData.undouChecks["juuten-運動-注意事項-mark"] ||
        formData.immediates["juuten-運動-注意事項"] !== "";
    }
    if (!formData.tabakoCheck) {
      formData.tabakoCheck = Object.values(formData.tabakoChecks).some(
        (checked) => checked,
      );
    }
  }

  function adaptSonotaChecks() {
    if (!formData.sonotaChecks["juuten-その他-その他-mark"]) {
      formData.sonotaChecks["juuten-その他-その他-mark"] =
        formData.sonotaChecks["juuten-その他-その他-mark"] ||
        formData.immediates["juuten-その他-その他"] !== "";
    }
    if (!formData.sonotaCheck) {
      formData.sonotaCheck = Object.values(formData.sonotaChecks).some(
        (checked) => checked,
      );
    }
  }

  function adaptKensaChecks() {
    if (!formData.kensaChecks["kensa-血糖-食後-mark"]) {
      formData.kensaChecks["kensa-血糖-食後-mark"] =
        formData.immediates["kensa-血糖-食後"] !== "";
    }
    if (!formData.kensaChecks["kensa-血糖-mark"]) {
      formData.kensaChecks["kensa-血糖-mark"] =
        formData.kensaChecks["kensa-血糖-mark"] ||
        formData.kensaChecks["kensa-血糖-空腹時-mark"] ||
        formData.kensaChecks["kensa-血糖-随時-mark"] ||
        formData.kensaChecks["kensa-血糖-食後-mark"] ||
        formData.immediates["kensa-血糖-値"] !== "";
    }
    if (!formData.kensaChecks["kensa-HbA1c-mark"]) {
      formData.kensaChecks["kensa-HbA1c-mark"] =
        formData.immediates["kensa-HbA1c"] !== "";
    }
    if (!formData.kensaChecks["kensa-総コレステロール-mark"]) {
      formData.kensaChecks["kensa-総コレステロール-mark"] =
        formData.immediates["kensa-総コレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-中性脂肪-mark"]) {
      formData.kensaChecks["kensa-中性脂肪-mark"] =
        formData.immediates["kensa-中性脂肪"] !== "";
    }
    if (!formData.kensaChecks["kensa-ＨＤＬコレステロール-mark"]) {
      formData.kensaChecks["kensa-ＨＤＬコレステロール-mark"] =
        formData.immediates["kensa-ＨＤＬコレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-ＬＤＬコレステロール-mark"]) {
      formData.kensaChecks["kensa-ＬＤＬコレステロール-mark"] =
        formData.immediates["kensa-ＬＤＬコレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-血液検査項目-その他-mark"]) {
      formData.kensaChecks["kensa-血液検査項目-その他-mark"] =
        formData.immediates["kensa-血液検査項目-その他"] !== "";
    }
    if (!formData.kensaChecks["kensa-栄養状態-mark"]) {
      formData.kensaChecks["kensa-栄養状態-mark"] =
        formData.kensaChecks["kensa-栄養状態-低栄養状態の恐れ"] ||
        formData.kensaChecks["kensa-栄養状態-良好"] ||
        formData.kensaChecks["kensa-栄養状態-肥満"];
    }
    if (!formData.kensaChecks["kensa-その他-その他-mark"]) {
      formData.kensaChecks["kensa-その他-その他-mark"] =
        formData.immediates["kensa-その他-その他"] !== "";
    }
  }

  function adaptChecks() {
    adaptShokujiChecks();
    adaptUndouChecks();
    adaptTabakoChecks();
    adaptSonotaChecks();
    adaptKensaChecks();
  }

  const default行動目標 =
    "現在の食事、運動を継続する。現在の処方の服用を継続する。";

  function adaptDiabetes() {
    if (formData.diseaseDiabetes) {
      if (formData.immediates["mokuhyou-HbA1c"] === "") {
        formData.immediates["mokuhyou-HbA1c"] = "7.0";
      }
      const t = formData.immediates["mokuhyou-達成目標"];
      const m = "HbA1c の値を 7.0 以下にコントロールする。";
      if (!t || t.indexOf(m) < 0) {
        formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
      }
      if (formData.immediates["mokuhyou-行動目標"] === "") {
        formData.immediates["mokuhyou-行動目標"] = default行動目標;
      }
      adaptChecks();
    } else {
      formData.immediates["mokuhyou-HbA1c"] = "";
    }
  }

  function adaptHypertension() {
    if (formData.diseaseHypertension) {
      if (formData.immediates["mokuhyou-BP"] === "") {
        formData.immediates["mokuhyou-BP"] = "130/80";
      }
      const t = formData.immediates["mokuhyou-達成目標"];
      const m = "血圧の平均を 130/80 以下にコントロールする。";
      if (!t || t.indexOf(m) < 0) {
        formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
      }
      if (formData.immediates["mokuhyou-行動目標"] === "") {
        formData.immediates["mokuhyou-行動目標"] = default行動目標;
      }
      formData.shokujiChecks["juuten-食事-食塩・調味料を控える-mark"] = true;
      adaptChecks();
    } else {
      formData.immediates["mokuhyou-BP"] = "";
    }
  }

  function adaptHyperlipidemia() {
    const t = formData.immediates["mokuhyou-達成目標"];
    const m = "ＬＤＬコレステロールの値を 140 以下にコントロールする。";
    if (!t || t.indexOf(m) < 0) {
      formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
    }
    if (formData.immediates["mokuhyou-行動目標"] === "") {
      formData.immediates["mokuhyou-行動目標"] = default行動目標;
    }
    adaptChecks();
  }

  init();

  async function init() {
    clinicInfo = await api.getClinicInfo();
  }

  function updateBox(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    key: keyof RyouyouKeikakushoData,
    checked: boolean,
  ) {
    updateValue(ryouyouKeikakushoData, key, checked ? "1" : "");
  }

  function updateValue(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    key: keyof RyouyouKeikakushoData,
    value: string,
  ) {
    ryouyouKeikakushoData[key] = value;
  }

  function populateDiseases(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    fdata: FormData,
  ) {
    updateBox(ryouyouKeikakushoData, "disease-diabetes", fdata.diseaseDiabetes);
    updateBox(
      ryouyouKeikakushoData,
      "disease-hypertension",
      fdata.diseaseHypertension,
    );
    updateBox(
      ryouyouKeikakushoData,
      "disease-hyperlipidemia",
      fdata.diseaseHyperlipidemia,
    );
  }

  function populateMokuhyou(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    fdata: FormData,
  ) {
    updateBox(
      ryouyouKeikakushoData,
      "mokuhyou-体重-mark",
      fdata.immediates["mokuhyou-体重"] !== "",
    );
    updateBox(
      ryouyouKeikakushoData,
      "mokuhyou-BMI-mark",
      fdata.immediates["mokuhyou-BMI"] !== "",
    );
    updateBox(
      ryouyouKeikakushoData,
      "mokuhyou-BP-mark",
      fdata.immediates["mokuhyou-BP"] !== "",
    );
    updateBox(
      ryouyouKeikakushoData,
      "mokuhyou-HbA1c-mark",
      fdata.immediates["mokuhyou-HbA1c"] !== "",
    );
  }

  function populateShokuji(data: RyouyouKeikakushoData, fdata: FormData) {
    for (const key in fdata.shokujiChecks) {
      // @ts-ignore
      updateBox(data, key, fdata.shokujiChecks[key]);
    }
    updateBox(data, "juuten-食事-mark", fdata.shokujiCheck);
    updateBox(data, "juuten-食事-食べ方-ゆっくり食べる", fdata.shokujiYukkuri);
  }

  function populateUndou(data: RyouyouKeikakushoData, fdata: FormData) {
    for (const key in fdata.undouChecks) {
      // @ts-ignore
      updateBox(data, key, fdata.undouChecks[key]);
    }
    updateBox(data, "juuten-運動-ウォーキング-mark", fdata.undouWalking);
    updateBox(data, "juuten-運動-ほぼ毎日", fdata.undouEveryDay);
    updateBox(
      data,
      "juuten-運動-息がはずむが会話が可能な強さ",
      fdata.undouIntensityBreath,
    );
    updateBox(data, "juuten-運動-mark", fdata.undouCheck);
  }

  function populateTabako(data: RyouyouKeikakushoData, fdata: FormData) {
    for (const key in fdata.tabakoChecks) {
      // @ts-ignore
      updateBox(data, key, fdata.tabakoChecks[key]);
    }
    updateBox(data, "juuten-たばこ-mark", fdata.tabakoCheck);
  }

  function populateSonota(data: RyouyouKeikakushoData, fdata: FormData) {
    for (const key in fdata.sonotaChecks) {
      // @ts-ignore
      updateBox(data, key, fdata.sonotaChecks[key]);
    }
    updateBox(data, "juuten-その他-mark", fdata.sonotaCheck);
  }

  function populateKensa(data: RyouyouKeikakushoData, fdata: FormData) {
    if (fdata.kensaDate !== "") {
      const issueDate = DateWrapper.from(fdata.kensaDate);
      updateValue(data, "kensa-採血日-月", issueDate.getMonth().toString());
      updateValue(data, "kensa-採血日-日", issueDate.getDay().toString());
    }
    for (const key in fdata.kensaChecks) {
      // @ts-ignore
      updateBox(data, key, fdata.kensaChecks[key]);
    }
  }

  function initWithStores(newStores: Partial<FormData>[]) {
    let buf: { id: number; formData: Partial<FormData> }[] = [];
    for (let n of newStores) {
      buf.push({ id: ++serialStoreId, formData: n });
    }
    stores = buf;
    const lastIndex = indexOfLastFormData(stores);
    formData = updateByPartial(
      mkFormData(),
      lastIndex >= 0 ? stores[lastIndex] : {},
    );
    formData.issueDate = DateWrapper.from(new Date()).asSqlDate();
    formData.immediates["issue-times"] = (stores.length + 1).toString();
    storesId = -1;
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: async (selected: Patient) => {
          patient = selected;
          initWithStores(
            (await getRyouyouKeikakushoMasterText(patient.patientId)) ?? [],
          );
          formData.patientId = patient.patientId;
        },
      },
    });
  }

  function doClearPatient() {
    patient = undefined;
    initWithStores([]);
  }

  function createOps(fdata: FormData): Op[] {
    let ryouyouKeikakushoData = mkRyouyouKeikakushoData();
    if (clinicInfo) {
      ryouyouKeikakushoData["医師氏名"] = clinicInfo?.doctorName;
    }
    populateWithIssueDate(ryouyouKeikakushoData, fdata);
    populateWithPatient(ryouyouKeikakushoData, fdata);
    populateDiseases(ryouyouKeikakushoData, fdata);
    populateMokuhyou(ryouyouKeikakushoData, fdata);
    populateShokuji(ryouyouKeikakushoData, fdata);
    populateUndou(ryouyouKeikakushoData, fdata);
    populateTabako(ryouyouKeikakushoData, fdata);
    populateSonota(ryouyouKeikakushoData, fdata);
    populateKensa(ryouyouKeikakushoData, fdata);
    for (let key in fdata.immediates) {
      // @ts-ignore
      ryouyouKeikakushoData[key] = fdata.immediates[key];
    }
    if (fdata.mode === "shokai") {
      return drawRyouyouKeikakushoShokai(ryouyouKeikakushoData);
    } else {
      ryouyouKeikakushoData["患者署名省略-mark"] = "1";
      return drawRyouyouKeikakushoKeizoku(ryouyouKeikakushoData);
    }
  }

  function doDisp() {
    let ops: Op[] = createOps(formData);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        viewBox: "0 0 210 297",
        scale: 2,
        kind: "ryouyou",
      },
    });
  }

  function doCreateForm() {
    console.log(createInputs());
    alert("code output to console");
  }

  function populateWithIssueDate(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    fdata: FormData,
  ) {
    if (fdata.issueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = DateWrapper.from(fdata.issueDate);
      ryouyouKeikakushoData["issue-year"] = d.getYear().toString();
      ryouyouKeikakushoData["issue-month"] = d.getMonth().toString();
      ryouyouKeikakushoData["issue-day"] = d.getDay().toString();
    } else {
      ryouyouKeikakushoData["issue-year"] = "";
      ryouyouKeikakushoData["issue-month"] = "";
      ryouyouKeikakushoData["issue-day"] = "";
    }
  }

  function populateWithPatient(
    ryouyouKeikakushoData: RyouyouKeikakushoData,
    fdata: FormData,
  ) {
    if (patient) {
      ryouyouKeikakushoData["patient-name"] =
        `${patient.lastName}${patient.firstName}`;
      switch (patient.sex) {
        case "M": {
          ryouyouKeikakushoData["patient-sex-male"] = "1";
          ryouyouKeikakushoData["patient-sex-female"] = "";
          break;
        }
        case "F": {
          ryouyouKeikakushoData["patient-sex-male"] = "";
          ryouyouKeikakushoData["patient-sex-female"] = "1";
          break;
        }
      }
      const d = DateWrapper.from(sqlDateToDate(patient.birthday));
      switch (d.getGengou()) {
        case "明治": {
          ryouyouKeikakushoData["birthdate-gengou-meiji"] = "1";
          break;
        }
        case "大正": {
          ryouyouKeikakushoData["birthdate-gengou-taishou"] = "1";
          break;
        }
        case "昭和": {
          ryouyouKeikakushoData["birthdate-gengou-shouwa"] = "1";
          break;
        }
        case "平成": {
          ryouyouKeikakushoData["birthdate-gengou-heisei"] = "1";
          break;
        }
        case "令和": {
          ryouyouKeikakushoData["birthdate-gengou-reiwa"] = "1";
          break;
        }
      }
      ryouyouKeikakushoData["birthdate-nen"] = d.getNen().toString();
      ryouyouKeikakushoData["birthdate-month"] = d.getMonth().toString();
      ryouyouKeikakushoData["birthdate-day"] = d.getDay().toString();
      const age = calcAge(patient.birthday, fdata.issueDate || new Date());
      ryouyouKeikakushoData["patient-age"] = age.toString();
    } else {
      ryouyouKeikakushoData["patient-name"] = "";
      ryouyouKeikakushoData["patient-sex-male"] = "";
      ryouyouKeikakushoData["patient-sex-female"] = "";
      ryouyouKeikakushoData["birthdate-gengou-meiji"] = "";
      ryouyouKeikakushoData["birthdate-gengou-taishou"] = "";
      ryouyouKeikakushoData["birthdate-gengou-shouwa"] = "";
      ryouyouKeikakushoData["birthdate-gengou-heisei"] = "";
      ryouyouKeikakushoData["birthdate-gengou-reiwa"] = "";
      ryouyouKeikakushoData["birthdate-nen"] = "";
      ryouyouKeikakushoData["birthdate-month"] = "";
      ryouyouKeikakushoData["birthdate-day"] = "";
      ryouyouKeikakushoData["patient-age"] = "";
    }
  }

  async function doFreshSave() {
    if (patient) {
      const store = effectiveFormDataOf(formData);
      const id = ++serialStoreId;
      stores = [{ id, formData: store }, ...stores];
      await api.saveRyouyouKeikakushoMasterText(
        patient.patientId,
        JSON.stringify(stores.map((s) => s.formData)),
      );
      storesId = id;
      storesAreaVisible = true;
    }
  }

  async function doUpdateSave() {
    if (storesId > 0 && patient) {
      const eff = effectiveFormDataOf(formData);
      const newStores: Partial<FormData>[] = [...stores].map((s) => {
        if (s.id === eff) {
          return eff;
        } else {
          return s.formData;
        }
      });
      await api.saveRyouyouKeikakushoMasterText(
        patient.patientId,
        JSON.stringify(newStores),
      );
      storesAreaVisible = true;
    } else {
      alert("選択されていないので、更新保存できません。");
    }
  }

  function getFormDataById(id: number): Partial<FormData> | undefined {
    for (let s of stores) {
      if (s.id === id) {
        return s.formData;
      }
    }
    return undefined;
  }

  function doSelectStore(id: number) {
    const f = getFormDataById(id);
    if (f) {
      formData = updateByPartial(mkFormData(), f);
      storesId = id;
    }
  }

  async function doDeleteStore(id: number) {
    if (patient) {
      if (!confirm("この療養計画書の記録を削除していいですか？")) {
        return;
      }
      stores = stores.filter((s) => s.id !== id);
      const newFormDataList: Partial<FormData>[] = stores.map(
        (s) => s.formData,
      );
      await api.saveRyouyouKeikakushoMasterText(
        patient?.patientId,
        JSON.stringify(newFormDataList),
      );
      if (storesId === id) {
        initWithStores(newFormDataList);
        storesId = 0;
      }
    }
  }

  async function doShowPdf(id: number) {
    if (patient) {
      let store: Partial<FormData> | undefined = getFormDataById(id);
      if (!store) {
        return;
      }
      let data = updateByPartial(mkFormData(), store);
      let ops = createOps(data);
      let tm = DateWrapper.fromDate(new Date());
      let filename = `${patient.patientId}-ryouyou-keikaku-${tm.getTimeStamp()}.pdf`;
      await api.createPdfFile(ops, "A4", filename);
      console.log("pdf", filename);
      let result = await fetch(api.portalTmpFileUrl(filename), {
        method: "GET",
      });
      if (result.ok) {
        let buf: ArrayBuffer = await result.arrayBuffer();
        let formData = new FormData();
        let blob = new Blob([buf], { type: "application/pdf" });
        formData.append("uploadfile-1", blob, filename);
        await api.uploadPatientImage(patient.patientId, formData);
        alert(`PDF saved as ${filename}`);
      }
    }
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
{#if isVisible}
  <div>
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button on:click={doClearPatient}>患者終了</button>
    {/if}
    <button on:click={doDisp}>表示</button>
    {#if patient}
      <button on:click={doFreshSave}>新規保存</button>
    {/if}
    {#if storesId > 0}
      <button on:click={doUpdateSave}>更新保存</button>
    {/if}
    {#if stores.length > 0}
      <button on:click={() => (storesAreaVisible = !storesAreaVisible)}
        >履歴</button
      >
    {/if}
  </div>
  {#if storesAreaVisible}
    <div
      style="margin:10px 0; border: 1px solid gray; padding: 10px; width: 600px;"
    >
      {#each stores as store (store.id)}
        <div>
          {store.formData.issueDate}
          <a
            href="javascript:void(0)"
            on:click={() => {
              doSelectStore(store.id);
            }}>選択</a
          >
          <a href="javascript:void(0)" on:click={() => doDeleteStore(store.id)}
            >削除</a
          >
          <a href="javascript:void(0)" on:click={() => doShowPdf(store.id)}
            >PDF保存</a
          >
        </div>
      {/each}
    </div>
  {/if}
  <div style="margin-top: 10px;">
    {#if patient}
      ({patient.patientId}) {patient.lastName} {patient.firstName}
    {/if}
  </div>
  <div class="form-area">
    <div class="form-area-work">
      <div>
        <input type="radio" value="shokai" bind:group={formData.mode} /> 初回
        <input type="radio" value="keizoku" bind:group={formData.mode} /> 継続
      </div>
      <div>
        発行日：<input type="text" bind:value={formData.issueDate} />
        {#if formData.mode === "keizoku"}
          <input
            type="text"
            bind:value={formData.immediates["issue-times"]}
            style="width:2rem"
          /> 回目
        {/if}
      </div>
      <div>
        主病：<input
          type="checkbox"
          bind:checked={formData.diseaseDiabetes}
          on:change={adaptDiabetes}
        />
        糖尿病
        <input
          type="checkbox"
          bind:checked={formData.diseaseHypertension}
          on:change={adaptHypertension}
        />
        高血圧
        <input
          type="checkbox"
          bind:checked={formData.diseaseHyperlipidemia}
          on:change={adaptHyperlipidemia}
        /> 高脂血症
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;">
        <span>【目標】</span>
        <div style="line-height:1.8em">
          体重：<input
            type="text"
            style:width="6em"
            bind:value={formData.immediates["mokuhyou-体重"]}
          />
          kg BMI：<input
            type="text"
            style:width="6em"
            bind:value={formData.immediates["mokuhyou-BMI"]}
          />
          血圧：<input
            type="text"
            style:width="6em"
            bind:value={formData.immediates["mokuhyou-BP"]}
          />
          <span style="white-space:nowrap">
            HbA1c：<input
              type="text"
              style:width="6em"
              bind:value={formData.immediates["mokuhyou-HbA1c"]}
            />
          </span>
          {#if formData.mode === "keizoku"}
            <div style="display: flex; align-items:top;margin:4px 0;">
              【達成状況】
              <textarea
                style="width: 400px; height: 4em; resize: vertical"
                bind:value={formData.immediates["mokuhyou-目標達成状況"]}
              />
            </div>
          {/if}
          <div style="display: flex; align-items:top;margin:4px 0;">
            【達成目標】
            <textarea
              style="width: 400px; height: 4em; resize: vertical"
              bind:value={formData.immediates["mokuhyou-達成目標"]}
            />
          </div>
          <div style="display: flex; align-items:top;margin:4px 0">
            【行動目標】
            <textarea
              style="width: 400px; height: 4em; resize: vertical"
              bind:value={formData.immediates["mokuhyou-行動目標"]}
            />
          </div>
        </div>
        <span style="grid-column-start:1;grid-column-end:3;"
          >【重点を置く領域と指導項目】</span
        >
      </div>
      <div style="margin-left:2em;">
        【<input bind:checked={formData.shokujiCheck} type="checkbox" />食事】
        <div style="margin-left: 2em" class="shokuji-area">
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.shokujiChecks["juuten-食事-摂取量を適正にする-mark"]
              }
              on:change={adaptChecks}
            /> 摂取量を適正にする
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.shokujiChecks["juuten-食事-食塩・調味料を控える-mark"]
              }
              on:change={adaptChecks}
            /> 食塩・調味料を控える
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.shokujiChecks[
                  "juuten-食事-食物繊維の摂取を増やす-mark"
                ]
              }
              on:change={adaptChecks}
            /> 食物繊維の摂取を増やす
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"]
              }
              on:change={adaptChecks}
            />
            外食の際の注意事項
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-外食の際の注意事項"]}
              on:change={adaptChecks}
            />
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.shokujiChecks[
                  "juuten-食事-油を使った料理の摂取を減らす-mark"
                ]
              }
              on:change={adaptChecks}
            /> 油を使った料理の摂取を減らす
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.shokujiChecks["juuten-食事-その他-mark"]}
              on:change={adaptChecks}
            /> その他
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.shokujiChecks["juuten-食事-節酒-mark"]}
              on:change={adaptChecks}
            />
            節酒
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-節酒"]}
              on:change={adaptChecks}
            />
            を週
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-節酒-回"]}
              on:change={adaptChecks}
              style="width: 4em"
            /> 回
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.shokujiChecks["juuten-食事-間食-mark"]}
              on:change={adaptChecks}
            />
            間食
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-間食"]}
              on:change={adaptChecks}
            />
            を週
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-間食-回"]}
              on:change={adaptChecks}
              style="width: 4em"
            /> 回
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.shokujiChecks["juuten-食事-食べ方-mark"]}
              on:change={adaptChecks}
            />
            食べ方
            <input
              type="checkbox"
              bind:checked={formData.shokujiYukkuri}
              on:change={adaptChecks}
            />
            ゆっくり食べる
            <input
              type="text"
              bind:value={formData.immediates["juuten-食事-食べ方"]}
              on:change={adaptChecks}
            />
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.shokujiChecks["juuten-食事-食事時間-mark"]}
              on:change={adaptChecks}
            /> 食事時間
          </div>
        </div>
      </div>
      <div style="margin-left:2em;">
        【<input bind:checked={formData.undouCheck} type="checkbox" />運動】
        <div
          style="display:grid;grid-template-columns:auto 1fr;margin-left:2em;"
        >
          <span style="flex-basis:auto;flex-shrink:0"
            ><input
              type="checkbox"
              bind:checked={formData.undouChecks["juuten-運動-種類-mark"]}
              on:change={adaptChecks}
            />&nbsp;</span
          >
          <div style="flex-grow:1">
            <div>
              運動処方・種類（
              <input
                type="checkbox"
                bind:checked={formData.undouWalking}
                on:change={adaptChecks}
              />
              ウォーキング
              <input
                type="text"
                bind:value={formData.immediates["juuten-運動-種類"]}
                on:change={adaptChecks}
              />）
            </div>
            <div>
              時間（３０分以上 <input
                type="text"
                bind:value={formData.immediates["juuten-運動-時間"]}
                on:change={adaptChecks}
              />）
            </div>
            <div>
              頻度<input
                type="checkbox"
                bind:checked={formData.undouEveryDay}
                on:change={adaptChecks}
              />
              ほぼ毎日、 週
              <input
                type="text"
                style="width:4em"
                bind:value={formData.immediates["juuten-運動-頻度"]}
                on:change={adaptChecks}
              /> 日
            </div>
            <div style="display:flex;align-items:top">
              <span style="flex-basis:auto;flex-shrink:0">強度</span>
              <div style="flex-grow:1">
                <input
                  type="checkbox"
                  bind:checked={formData.undouIntensityBreath}
                  on:change={adaptChecks}
                />
                息がはずむが会話が可能な強さ or
                <input
                  type="text"
                  style="width:4em"
                  bind:value={formData.immediates["juuten-運動-強度-脈拍"]}
                  on:change={adaptChecks}
                />
                拍／分 or
                <input
                  type="text"
                  bind:value={formData.immediates["juuten-運動-強度-その他"]}
                  on:change={adaptChecks}
                />
              </div>
            </div>
          </div>
          <span style="flex-basis:auto;flex-shrink:0"
            ><input
              type="checkbox"
              bind:checked={formData.undouChecks["juuten-運動-活動量-mark"]}
              on:change={adaptChecks}
            />&nbsp;</span
          >
          <div>
            日常生活の活動量増加 <input
              type="text"
              bind:value={formData.immediates["juuten-運動-活動量"]}
              on:change={adaptChecks}
            />
          </div>
          <span style="flex-basis:auto;flex-shrink:0"
            ><input
              type="checkbox"
              bind:checked={formData.undouChecks["juuten-運動-注意事項-mark"]}
              on:change={adaptChecks}
            />&nbsp;</span
          >
          <div>
            運動時の注意事項など
            <input
              type="text"
              bind:value={formData.immediates["juuten-運動-注意事項"]}
              on:change={adaptChecks}
            />
          </div>
        </div>
      </div>
      <div style="margin-left:2em;">
        【<input
          bind:checked={formData.tabakoCheck}
          on:change={adaptChecks}
          type="checkbox"
        />たばこ】
        <div style="margin-left: 2em">
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.tabakoChecks["juuten-たばこ-非喫煙者-mark"]
              }
              on:change={adaptChecks}
            /> 非喫煙者
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.tabakoChecks["juuten-たばこ-禁煙・節煙の有効性-mark"]
              }
              on:change={adaptChecks}
            /> 禁煙・節煙の有効性
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={
                formData.tabakoChecks["juuten-たばこ-禁煙の実施補法等-mark"]
              }
              on:change={adaptChecks}
            /> 禁煙の実施補法等
          </div>
        </div>
      </div>
      <div style="margin-left:2em;">
        【<input
          bind:checked={formData.sonotaCheck}
          on:change={adaptChecks}
          type="checkbox"
        />その他】
        <div style="margin-left: 2em">
          <span style="white-space:nowrap">
            <input
              type="checkbox"
              bind:checked={formData.sonotaChecks["juuten-その他-仕事-mark"]}
              on:change={adaptChecks}
            /> 仕事
          </span>
          <span style="white-space:nowrap">
            <input
              type="checkbox"
              bind:checked={formData.sonotaChecks["juuten-その他-余暇-mark"]}
              on:change={adaptChecks}
            /> 余暇
          </span>
          <span style="white-space:nowrap">
            <input
              type="checkbox"
              bind:checked={
                formData.sonotaChecks["juuten-その他-睡眠の確保-mark"]
              }
              on:change={adaptChecks}
            /> 睡眠の確保
          </span>
          <span style="white-space:nowrap">
            <input
              type="checkbox"
              bind:checked={formData.sonotaChecks["juuten-その他-減量-mark"]}
              on:change={adaptChecks}
            /> 減量
          </span>
          <span style="white-space:nowrap">
            <input
              type="checkbox"
              bind:checked={
                formData.sonotaChecks["juuten-その他-家庭での計測-mark"]
              }
              on:change={adaptChecks}
            /> 家庭での計測
          </span>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.sonotaChecks["juuten-その他-その他-mark"]}
              on:change={adaptChecks}
            />
            その他
            <input
              type="text"
              bind:value={formData.immediates["juuten-その他-その他"]}
              on:change={adaptChecks}
            />
          </div>
        </div>
      </div>
      <div>
        <span>【検査】</span>
        <div
          style="display:grid;grid-template-columns:1fr 1fr;margin-left:2em;column-gap:6px"
        >
          <div>
            【血液検査項目】
            <span style="white-space:nowrap;"
              >採血日 <input
                type="text"
                style="width:6em"
                bind:value={formData.kensaDate}
              /></span
            >
            <div style="display:grid;grid-template-columns:auto 1fr;">
              <span
                ><input
                  type="checkbox"
                  bind:checked={formData.kensaChecks["kensa-血糖-mark"]}
                />&nbsp;</span
              >
              <div>
                血糖 (<input
                  type="checkbox"
                  bind:checked={formData.kensaChecks["kensa-血糖-空腹時-mark"]}
                  on:change={adaptChecks}
                />
                空腹時
                <input
                  type="checkbox"
                  bind:checked={formData.kensaChecks["kensa-血糖-随時-mark"]}
                  on:change={adaptChecks}
                />
                随時
                <span style="white-space:nowrap;"
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks["kensa-血糖-食後-mark"]}
                    on:change={adaptChecks}
                  />
                  食後
                  <input
                    type="text"
                    style="width:2em"
                    bind:value={formData.immediates["kensa-血糖-食後"]}
                    on:change={adaptChecks}
                  /> 時間)</span
                >
                (<input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-血糖-値"]}
                  on:change={adaptChecks}
                /> mg/dl)
              </div>
              <span
                ><input
                  type="checkbox"
                  bind:checked={formData.kensaChecks["kensa-HbA1c-mark"]}
                />&nbsp;</span
              >
              <div>
                HbA1c <input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-HbA1c"]}
                  on:change={adaptChecks}
                /> %
              </div>
            </div>
          </div>
          <div>
            <div
              style="display:grid;grid-template-columns:auto 1fr;row-gap:4px"
            >
              <span
                ><input
                  type="checkbox"
                  bind:checked={
                    formData.kensaChecks["kensa-総コレステロール-mark"]
                  }
                />&nbsp;</span
              >
              <div>
                総コレステロール <input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-総コレステロール"]}
                  on:change={adaptChecks}
                /> mg/dl
              </div>
              <span
                ><input
                  type="checkbox"
                  bind:checked={formData.kensaChecks["kensa-中性脂肪-mark"]}
                />&nbsp;</span
              >
              <div>
                中性脂肪 <input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-中性脂肪"]}
                  on:change={adaptChecks}
                /> mg/dl
              </div>
              <span
                ><input
                  type="checkbox"
                  bind:checked={
                    formData.kensaChecks["kensa-ＨＤＬコレステロール-mark"]
                  }
                />&nbsp;</span
              >
              <div>
                HDLコレステロール <input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-ＨＤＬコレステロール"]}
                  on:change={adaptChecks}
                /> mg/dl
              </div>
              <span
                ><input
                  type="checkbox"
                  bind:checked={
                    formData.kensaChecks["kensa-ＬＤＬコレステロール-mark"]
                  }
                />&nbsp;</span
              >
              <div>
                LDLコレステロール <input
                  type="text"
                  style="width:4em;"
                  bind:value={formData.immediates["kensa-ＬＤＬコレステロール"]}
                  on:change={adaptChecks}
                /> mg/dl
              </div>
              <span
                ><input
                  type="checkbox"
                  bind:checked={
                    formData.kensaChecks["kensa-血液検査項目-その他-mark"]
                  }
                />&nbsp;</span
              >
              <div>
                その他 <input
                  type="text"
                  style="width:14em;"
                  bind:value={formData.immediates["kensa-血液検査項目-その他"]}
                  on:change={adaptChecks}
                />
              </div>
            </div>
          </div>
        </div>
        <div style="margin-left:2em;">
          <div>【その他】</div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.kensaChecks["kensa-栄養状態-mark"]}
            />
            栄養状態（
            <input
              type="checkbox"
              bind:checked={
                formData.kensaChecks["kensa-栄養状態-低栄養状態の恐れ"]
              }
              on:change={adaptChecks}
            />
            低栄養状態の恐れ
            <input
              type="checkbox"
              bind:checked={formData.kensaChecks["kensa-栄養状態-良好"]}
              on:change={adaptChecks}
            />
            良好
            <input
              type="checkbox"
              bind:checked={formData.kensaChecks["kensa-栄養状態-肥満"]}
              on:change={adaptChecks}
            /> 肥満 ）
          </div>
          <div>
            <input
              type="checkbox"
              bind:checked={formData.kensaChecks["kensa-その他-その他-mark"]}
            />
            その他
            <input
              type="text"
              bind:value={formData.immediates["kensa-その他-その他"]}
              on:change={adaptChecks}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="dev-menu">
      <span>Dev</span>
      <div
        class="chevrons"
        on:click={() => {
          showDev = !showDev;
        }}
      >
        {#if showDev}
          <ChevronUp />
        {:else}
          <ChevronDown />
        {/if}
      </div>
    </div>
    {#if showDev}
      <button on:click={doCreateForm}>Create Form</button>
    {/if}
  </div>
{/if}

<style>
  .form-area {
    margin: 10px 0;
  }

  .form-area-work {
    border: 1px solid gray;
    padding: 10px;
    width: 600px;
  }

  .form-area-work > div {
    margin: 4px 0;
  }

  .dev-menu {
    display: flex;
    align-items: center;
    color: gray;
  }

  .chevrons {
    display: inline-block;
    margin-left: 4px;
    position: relative;
    top: 3px;
  }

  .shokuji-area > div {
    margin: 3px 0;
  }
</style>
