<script lang="ts">
  import type { ShohouTextMemo } from "@/practice/exam/record/text/text-memo";
  import { cache } from "../cache";
  import Dialog from "../Dialog.svelte";
  import { sign_presc } from "../hpki-api";
  import { toZenkaku } from "../zenkaku";
  import { amountDisp, daysTimesDisp, usageDisp } from "./disp/disp-util";
  import NewGroupDialog from "./NewGroupDialog.svelte";
  import { registerPresc, shohouHikae, shohouHikaeFilename } from "./presc-api";
  import { createPrescInfo, type PrescInfoData, type 備考レコード, type 提供情報レコード } from "./presc-info";
  import {
    checkShohouResult,
    type HikaeResult,
    type RegisterResult,
  } from "./shohou-interface";
  import api from "../api";
  import BikouForm from "./BikouForm.svelte";
  import ShowCodeDialog from "./ShowCodeDialog.svelte";
  import KigenForm from "./KigenForm.svelte";
  import InfoForm from "./InfoForm.svelte";

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
  let showBikou = false;
  let showKigen = false;
  let showInfo = false;

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

  function doToggleBikou() {
    showBikou = !showBikou;
  }

  function addBikou(record: 備考レコード) {
    let cur = shohou.備考レコード ?? [];
    cur = [...cur];
    cur.push(record);
    shohou.備考レコード = cur;
    shohou = shohou;
  }

  function deleteBikou(record: 備考レコード) {
    if( shohou.備考レコード != undefined ){
      shohou.備考レコード = shohou.備考レコード.filter(r => r !== record);
      shohou = shohou;
    }
  }

  function doCode() {
    const code = createPrescInfo(shohou);
    const d: ShowCodeDialog = new ShowCodeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        code,
      }
    })
  }

  function doToggleKigen() {
    showKigen = !showKigen;
  }

  function setKigen(kigen: string | undefined) {
    shohou.使用期限年月日 = kigen;
    shohou = shohou;
  }

  function doToggleInfo() {
    showInfo = !showInfo;
  }

  function setInfo(info: 提供情報レコード | undefined) {
    shohou.提供情報レコード = info;
    shohou = shohou;
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
    <a href="javascript:void(0)" on:click={doToggleBikou}>備考</a>
    <a href="javascript:void(0)" on:click={doToggleKigen}>有効期限</a>
    <a href="javascript:void(0)" on:click={doToggleInfo}>提供情報</a>
  </div>
  {#if showBikou}<BikouForm records={shohou.備考レコード ?? []} onEnter={addBikou} onDelete={deleteBikou} />{/if}
  {#if showKigen}<KigenForm kigen={shohou.使用期限年月日} onEnter={setKigen}/>{/if}
  {#if showInfo}<InfoForm record={shohou.提供情報レコード ?? {}} onEnter={setInfo}/>{/if}

  <div class="commands">
    <a href="javascript:void(0)" on:click={doCode}>コード</a>
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
