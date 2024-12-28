<script lang="ts">
  import type { ShohouTextMemo } from "@/practice/exam/record/text/text-memo";
  import { cache } from "../cache";
  import Dialog from "../Dialog.svelte";
  import { sign_presc } from "../hpki-api";
  import { toZenkaku } from "../zenkaku";
  import { amountDisp, daysTimesDisp, usageDisp } from "./disp/disp-util";
  import NewGroupDialog from "./NewGroupDialog.svelte";
  import { registerPresc, shohouHikae, shohouHikaeFilename } from "./presc-api";
  import { createPrescInfo, type PrescInfoData } from "./presc-info";
  import {
    checkShohouResult,
    type HikaeResult,
    type RegisterResult,
  } from "./shohou-interface";
  import api from "../api";

  export let destroy: () => void;
  export let title: string;
  export let shohou: PrescInfoData;
  export let onDelete: (() => void) | undefined;
  export let at: string;
  export let onSave: (shohou: PrescInfoData) => void;
  export let onRegistered: (
    shohou: PrescInfoData,
    prescriptionId: string
  ) => void;

  function doDelete() {
    if (onDelete && confirm("この処方を削除していいですか？")) {
      destroy();
      onDelete();
    }
  }

  function doNewGroup() {
    const d: NewGroupDialog = new NewGroupDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
        onEnter: (group) => {
          shohou.RP剤情報グループ.push(group);
          shohou = shohou;
        },
      },
    });
  }

  function doSave() {
    destroy();
    onSave(shohou);
  }

  async function doRegister() {
    if (shohou.引換番号) {
      alert("既に登録されています。");
      return;
    }
    const prescInfo = createPrescInfo(shohou);
    console.log("prescInfo", prescInfo);
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
    shohou.引換番号 = register.XmlMsg.MessageBody?.AccessCode;
    const prescriptionId = register.XmlMsg.MessageBody?.PrescriptionId;
    if (prescriptionId == undefined) {
      throw new Error("undefined prescriptionId");
    }
    destroy();
    saveHikae(kikancode, prescriptionId);
    onRegistered(shohou, prescriptionId);
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
</script>

<Dialog {title} {destroy}>
  <div>院外処方</div>
  <div>Ｒｐ）</div>
  <div class="groups-wrapper">
    {#each shohou.RP剤情報グループ as group, i}
      <div>{toZenkaku((i + 1).toString())}）</div>
      <div>
        <div>
          {#each group.薬品情報グループ as drug}
            <div>
              {drug.薬品レコード.薬品名称}
              {amountDisp(drug.薬品レコード)}
            </div>
          {/each}
        </div>
        <div>{usageDisp(group)} {daysTimesDisp(group)}</div>
      </div>
    {/each}
  </div>
  <div>
    <a href="javascript:void(0)" on:click={doNewGroup}>新規グループ</a>
  </div>

  <div class="commands">
    {#if onDelete}
    <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    <button on:click={doRegister}>登録</button>
    <button on:click={doSave}>保存</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .groups-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
