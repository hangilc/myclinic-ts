<script lang="ts">
  import type { ShohouTextMemo } from "@/practice/exam/record/text/text-memo";
  import { cache } from "../cache";
  import Dialog from "../Dialog.svelte";
  import { sign_presc } from "../hpki-api";
  import { toZenkaku } from "../zenkaku";
  import {
    amountDisp,
    daysTimesDisp,
    drugDisp,
    unevenDisp,
    usageDisp,
  } from "./disp/disp-util";
  import NewGroupDialog from "./EditGroupDialog.svelte";
  import { registerPresc, shohouHikae, shohouHikaeFilename } from "./presc-api";
  import {
    createPrescInfo,
    PrescInfoWrapper,
    薬品情報Wrapper,
    type PrescInfoData,
    type RP剤情報,
    type 備考レコード,
    type 公費レコード,
    type 提供情報レコード,
    type 薬品情報,
  } from "./presc-info";
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
  import EditGroupDialog from "./EditGroupDialog.svelte";
  import { DateWrapper } from "myclinic-util";
  import type { Shohousen2024Data } from "../drawer/forms/shohousen-2024/shohousenData2024";
  import { drawShohousen2024NoRefill } from "../drawer/forms/shohousen-2024/shohousenDrawer2024NoRefill";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import type { DrugGroup, Senpatsu, Shohou, Usage } from "../parse-shohou";
  import type { Drug } from "@/lib/parse-shohou";

  export let destroy: () => void;
  export let title: string;
  export let shohou: PrescInfoData;
  export let onDelete: (() => void) | undefined;
  export let at: string;
  export let onSave: (shohou: PrescInfoData) => void;
  export let onRegistered:
    | ((shohou: PrescInfoData, prescriptionId: string) => void)
    | undefined;
  let showBikou = false;
  let showKigen = false;
  let showInfo = false;

  function doDelete() {
    if (onDelete && confirm("この処方を削除していいですか？")) {
      destroy();
      onDelete();
    }
  }

  function prepareKouhiList(): [
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
  ] {
    return [
      shohou.第一公費レコード,
      shohou.第二公費レコード,
      shohou.第三公費レコード,
      shohou.特殊公費レコード,
    ];
  }

  function doNewGroup() {
    const d: NewGroupDialog = new NewGroupDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
        onEnter: (group) => {
          let cur = shohou.RP剤情報グループ;
          cur = [...cur];
          cur.push(group);
          shohou = Object.assign({}, shohou, {
            RP剤情報グループ: cur,
          });
        },
        group: undefined,
        kouhiList: prepareKouhiList(),
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
    if (!onRegistered) {
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
    shohou = Object.assign({}, shohou, {
      備考レコード: cur,
    });
  }

  function deleteBikou(record: 備考レコード) {
    if (shohou.備考レコード != undefined) {
      shohou = Object.assign({}, shohou, {
        備考レコード: shohou.備考レコード.filter((r) => r !== record),
      });
    }
  }

  function doCode() {
    const code = createPrescInfo(shohou);
    const d: ShowCodeDialog = new ShowCodeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        code,
      },
    });
  }

  function doToggleKigen() {
    showKigen = !showKigen;
  }

  function setKigen(kigen: string | undefined) {
    shohou = Object.assign({}, shohou, {
      使用期限年月日: kigen,
    });
  }

  function doToggleInfo() {
    showInfo = !showInfo;
  }

  function setInfo(info: 提供情報レコード | undefined) {
    shohou = Object.assign({}, shohou, {
      提供情報レコード: info,
    });
  }

  function doEditGroup(group: RP剤情報) {
    const d: EditGroupDialog = new EditGroupDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
        group,
        onEnter: (newGroup) => {
          const gs = shohou.RP剤情報グループ.map((g) =>
            g === group ? newGroup : g
          );
          shohou = Object.assign({}, shohou, { RP剤情報グループ: gs });
        },
        onDelete:
          shohou.RP剤情報グループ.length <= 1
            ? undefined
            : () => {
                const gs = shohou.RP剤情報グループ.filter((g) => g !== group);
                shohou = Object.assign({}, shohou, { RP剤情報グループ: gs });
              },
        kouhiList: prepareKouhiList(),
      },
    });
  }

  function isTodaysShohousen(shohou: PrescInfoData): boolean {
    const date = DateWrapper.fromOnshiDate(shohou.処方箋交付年月日);
    const today = DateWrapper.from(new Date());
    return date.asSqlDate() === today.asSqlDate();
  }

  function doPrint() {
    if (!isTodaysShohousen(shohou)) {
      if (!confirm("本日の処方箋でありませんが、印刷しますか？")) {
        return;
      }
    }
    const wrapper = new PrescInfoWrapper(shohou);
    let bikou: string[] = shohou.備考レコード?.map((bikou) => bikou.備考) ?? [];
    const joho_info =
      shohou.提供情報レコード?.提供診療情報レコード?.map((info) => {
        if (info.薬品名称) {
          return `（${info.薬品名称}）${info.コメント}`;
        } else {
          return info.コメント;
        }
      }) ?? [];
    const joho_kensa =
      shohou.提供情報レコード?.検査値データ等レコード?.map(
        (joho) => joho.検査値データ等
      ) ?? [];
    bikou = [...bikou, ...joho_info, ...joho_kensa];
    const kouhiCount = wrapper.kouhiCount();
    const hasMixedKouhi = wrapper.hasMixedKouhi();
    let groups: DrugGroup[] = shohou.RP剤情報グループ.map((g) =>
      renderGroup(g, kouhiCount, hasMixedKouhi)
    );
    const drugs: Shohou = {
      groups,
      shohouComments: [],
      bikou,
      kigen: shohou.使用期限年月日
        ? DateWrapper.from(shohou.使用期限年月日).asSqlDate()
        : undefined,
    };
    const data: Shohousen2024Data = {
      clinicAddress: shohou.医療機関所在地,
      clinicName: shohou.医療機関名称,
      clinicPhone: `電話 ${shohou.医療機関電話番号}`,
      doctorName: shohou.医師漢字氏名,
      clinicTodoufuken: shohou.医療機関都道府県コード,
      clinicKikancode: shohou.医療機関コード,
      hokenshaBangou: shohou.保険者番号,
      hihokenshaKigou: shohou.被保険者証記号,
      hihokenshaBangou: shohou.被保険者証番号,
      edaban: shohou.被保険者証枝番,
      futansha: shohou.第一公費レコード?.公費負担者番号,
      jukyuusha: shohou.第一公費レコード?.公費受給者番号,
      futansha2: shohou.第二公費レコード?.公費負担者番号,
      jukyuusha2: shohou.第二公費レコード?.公費受給者番号,
      shimei: shohou.患者漢字氏名,
      birthdate: DateWrapper.from(shohou.患者生年月日).asSqlDate(),
      sex: shohou.患者性別 === "男" ? "M" : "F",
      hokenKubun:
        shohou.被保険者被扶養者 === "被保険者" ? "hihokensha" : "hifuyousha",
      koufuDate: DateWrapper.from(shohou.処方箋交付年月日).asSqlDate(),
      drugs,
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
  }

  function renderGroup(
    rp: RP剤情報,
    nkouhi: number,
    hasMixedKouhi: boolean
  ): DrugGroup {
    let drugs: Drug[] = rp.薬品情報グループ.map((drug) => {
      return {
        name: drug.薬品レコード.薬品名称,
        amount: toZenkaku(drug.薬品レコード.分量),
        unit: toZenkaku(drug.薬品レコード.単位名) + unevenRep(drug),
        senpatsu: resolveSenpatsu(drug),
        drugComments: resolveDrugComments(drug, nkouhi, hasMixedKouhi),
      };
    });
    let usage: Usage;
    switch (rp.剤形レコード.剤形区分) {
      case "内服": {
        usage = {
          kind: "days",
          days: toZenkaku(rp.剤形レコード.調剤数量.toString()),
          usage: rp.用法レコード.用法名称,
        };
        break;
      }
      case "頓服": {
        usage = {
          kind: "times",
          times: toZenkaku(rp.剤形レコード.調剤数量.toString()),
          usage: rp.用法レコード.用法名称,
        };
        break;
      }
      default: {
        usage = { kind: "other", usage: rp.用法レコード.用法名称 };
        break;
      }
    }
    let groupComments: string[] = resolveGroupComments(rp);
    return {
      drugs,
      usage,
      groupComments,
    };
  }

  function resolveSenpatsu(drug: 薬品情報): Senpatsu | undefined {
    for (let info of drug.薬品補足レコード ?? []) {
      if (info.薬品補足情報 === "後発品変更不可") {
        return "henkoufuka";
      } else if (info.薬品補足情報 === "先発医薬品患者希望") {
        return "kanjakibou";
      }
    }
    return undefined;
  }

  function unevenRep(drug: 薬品情報): string {
    if (drug.不均等レコード) {
      const parts: string[] = [];
      const rec = drug.不均等レコード;
      parts.push(rec.不均等１回目服用量);
      parts.push(rec.不均等２回目服用量);
      if (rec.不均等３回目服用量) {
        parts.push(rec.不均等３回目服用量);
      }
      if (rec.不均等４回目服用量) {
        parts.push(rec.不均等４回目服用量);
      }
      if (rec.不均等５回目服用量) {
        parts.push(rec.不均等５回目服用量);
      }
      return "（" + parts.map((part) => toZenkaku(part)).join("ー") + "）";
    } else {
      return "";
    }
  }

  function resolveGroupComments(rp: RP剤情報): string[] {
    const recs = rp.用法補足レコード;
    if (recs) {
      let addition: string = "";
      const info: string[] = [];
      for (let rec of recs) {
        if (rec.用法補足区分 === "用法の続き") {
          addition += rec.用法補足情報;
        } else {
          info.push(rec.用法補足情報);
        }
      }
      return [addition + info.map((s) => `【${s}】`).join("")];
    } else {
      return [];
    }
  }

  function resolveDrugComments(
    drug: 薬品情報,
    nkouhi: number,
    hasMixedKouhi: boolean
  ): string[] {
    const texts: string[] = [];
    const cs: string[] = [];
    drug.薬品補足レコード?.forEach((rec) => {
      switch (rec.薬品補足情報) {
        case "一包化": {
          cs.push(rec.薬品補足情報);
          break;
        }
        case "粉砕": {
          cs.push(rec.薬品補足情報);
          break;
        }
        case "後発品変更不可": {
          // nop
          break;
        }
        case "剤形変更不可": {
          cs.push(rec.薬品補足情報);
          break;
        }
        case "含量規格変更不可": {
          cs.push(rec.薬品補足情報);
          break;
        }
        case "剤形変更不可及び含量規格変更不可": {
          cs.push(rec.薬品補足情報);
          break;
        }
        case "先発医薬品患者希望": {
          // nop
          break;
        }
        default: {
          texts.push(rec.薬品補足情報);
          break;
        }
      }
    });
    if (hasMixedKouhi) {
      if (drug.負担区分レコード) {
        let ks: string[] = [];
        if( drug.負担区分レコード.第一公費負担区分){
          ks.push("第一");
        }
        if( drug.負担区分レコード.第二公費負担区分){
          ks.push("第二");
        }
        if( drug.負担区分レコード.第三公費負担区分){
          ks.push("第三");
        }
        if( drug.負担区分レコード.特殊公費負担区分){
          ks.push("特殊");
        }
        if( nkouhi === 1 && ks.length === 1 ){
          cs.push("公費対象");
        } else {
          ks.forEach(k => cs.push(`${k}公費対象`));
        }
      } else {
        cs.push("公費対象外");
      }
    }
    return [texts.join("") + cs.map((c) => `【${c}】`).join("")];
  }
</script>

<Dialog {title} {destroy}>
  <div>院外処方</div>
  <div>Ｒｐ）</div>
  <div class="groups-wrapper">
    {#each shohou.RP剤情報グループ as group, i}
      <div>{toZenkaku((i + 1).toString())}）</div>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div style="cursor:pointer" on:click={() => doEditGroup(group)}>
        <div>
          {#each group.薬品情報グループ as drug}
            <div>{drugDisp(drug)}</div>
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
  {#if showBikou}<BikouForm
      records={shohou.備考レコード ?? []}
      onEnter={addBikou}
      onDelete={deleteBikou}
    />{/if}
  {#if showKigen}<KigenForm
      kigen={shohou.使用期限年月日}
      onEnter={setKigen}
    />{/if}
  {#if showInfo}<InfoForm
      record={shohou.提供情報レコード ?? {}}
      onEnter={setInfo}
    />{/if}

  <div class="commands">
    <a href="javascript:void(0)" on:click={doCode}>コード</a>
    {#if onDelete}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    {#if onRegistered}
      <button on:click={doRegister}>登録</button>
    {/if}
    <button on:click={doSave}>保存</button>
    <button on:click={doPrint}>印刷</button>
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
