<script lang="ts">
  import type { ClinicInfo, Text, VisitEx } from "myclinic-model";
  import DenshiShohouForm from "./DenshiShohouForm.svelte";
  import { initPrescInfoData } from "./visit-shohou";
  import { createPrescInfo, type PrescInfoData } from "./presc-info";
  import type {
    Init,
    Source,
  } from "./denshi-shohou-form/denshi-shohou-form-types";
  import Dialog from "../Dialog.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import api from "../api";
  import { registerPresc, shohouHikae, shohouHikaeFilename } from "./presc-api";
  import {
    checkShohouResult,
    type HikaeResult,
    type RegisterResult,
  } from "./shohou-interface";
  import { sign_presc } from "../hpki-api";
  import { cache } from "../cache";

  export let visit: VisitEx;
  export let clinicInfo: ClinicInfo;
  export let destroy: () => void;
  let sourceList: Source[] = [];
  let getPrescInfoData: () => PrescInfoData;

  const data: PrescInfoData = initPrescInfoData(
    visit.asVisit,
    visit.patient,
    visit.hoken,
    clinicInfo
  );
  const init: Init = {
    kind: "denshi",
    data,
  };

  async function doSave() {
    const data = getPrescInfoData();
    const text: Text = {
      textId: 0,
      visitId: visit.visitId,
      content: "",
    };
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou: data,
      prescriptionId: undefined,
    });
    await api.enterText(text);
    destroy();
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
    const shohou = getPrescInfoData();
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
    Object.assign(shohou, {
      引換番号: register.XmlMsg.MessageBody?.AccessCode,
    });
    const prescriptionId = register.XmlMsg.MessageBody?.PrescriptionId;
    if (prescriptionId == undefined) {
      throw new Error("undefined prescriptionId");
    }
    saveHikae(kikancode, prescriptionId);
    const text: Text = {
      textId: 0,
      visitId: visit.visitId,
      content: "",
    };
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou,
      prescriptionId,
    });
    await api.enterText(text);
    destroy();
  }

  function doCancel() {
    destroy();
  }
</script>

<Dialog title="新規処方（電子）" destroy={doCancel} styleWidth="600px">
  <DenshiShohouForm
    {init}
    at={visit.visitedAt.substring(0, 10)}
    kouhiList={visit.hoken.kouhiList}
    bind:sourceList
    bind:getPrescInfoData
  />
  <div style="margin-top:10px;text-align:right;">
    {#if sourceList.length > 0}
      <button on:click={doRegister}>電子登録</button>
      <button on:click={doSave}>保存</button>
    {/if}
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>
