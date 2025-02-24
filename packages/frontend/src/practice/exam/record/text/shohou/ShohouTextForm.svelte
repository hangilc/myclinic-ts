<script lang="ts">
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import {
    createPrescInfo,
    type PrescInfoData,
  } from "@/lib/denshi-shohou/presc-info";
  import DenshiHenkanDialog from "../regular/DenshiHenkanDialog.svelte";
  import type { Kouhi } from "myclinic-model";
  import { denshiToPrint } from "./denshi-to-print";
  import { drawShohousen2024NoRefill } from "@/lib/drawer/forms/shohousen-2024/shohousenDrawer2024NoRefill";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import ShowCodeDialog from "@/lib/denshi-shohou/ShowCodeDialog.svelte";
  import { sign_presc } from "@/lib/hpki-api";
  import { cache } from "@/lib/cache";
  import { registerPresc, shohouHikae, shohouHikaeFilename } from "@/lib/denshi-shohou/presc-api";
  import { checkShohouResult, type HikaeResult, type RegisterResult } from "@/lib/denshi-shohou/shohou-interface";
  import api from "@/lib/api";

  export let shohou: PrescInfoData;
  export let at: string;
  export let kouhiList: Kouhi[];
  export let onCancel: () => void;
  export let onModified: (newShohou: PrescInfoData) => void;
  export let onRegistered: (
    shohou: PrescInfoData,
    prescriptionId: string
  ) => void;

  function doEdit() {
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
</script>

<div style="border:1px solid green;padding:10px;border-radius:6px">
  <DenshiShohouDisp {shohou} prescriptionId={undefined} />
</div>
<div style="margin-top:6px;">
  <a href="javascript:void(0)" on:click={doRegister}>登録</a>
  <a href="javascript:void(0)" on:click={doEdit}>編集</a>
  <a href="javascript:void(0)" on:click={doPrint}>印刷</a>
  <a href="javascript:void(0)" on:click={doCode}>コード</a>
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
