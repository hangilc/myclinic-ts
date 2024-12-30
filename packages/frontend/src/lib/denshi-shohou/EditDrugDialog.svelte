<script lang="ts">
  import SearchIyakuhinMasterDialog from "./SearchIyakuhinMasterDialog.svelte";
  import type {
    不均等レコード,
    公費レコード,
    薬品レコード,
    薬品情報,
    薬品補足レコード,
    負担区分レコード,
  } from "./presc-info";
  import type { 剤形区分 } from "./denshi-shohou";
  import { toHankaku } from "../zenkaku";
  import Dialog from "../Dialog.svelte";
  import api from "../api";
  import UnevenForm from "./UnevenForm.svelte";
  import { unevenDisp } from "./disp/disp-util";
  import DrugAdditionalsForm from "./DrugAdditionalsForm.svelte";
  import SearchKizaiMasterDialog from "./SearchKizaiMasterDialog.svelte";
  import FutanKubunForm from "./FutanKubunForm.svelte";

  export let destroy: () => void;
  export let drug: 薬品情報 | undefined;
  export let at: string;
  export let onEnter: (drug: 薬品情報) => void;
  export let onDelete: (() => void) | undefined;
  export let zaikei: 剤形区分;
  export let kouhiList: [
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
  ];
  let master:
    | {
        kind: "iyakuhin" | "kizai";
        master: { code: string; name: string; unit: string };
      }
    | undefined;
  let amount = drug?.薬品レコード.分量 ?? "";
  let unevenRecord: 不均等レコード | undefined =
    drug?.不均等レコード ?? undefined;
  let additionals: 薬品補足レコード[] | undefined =
    drug?.薬品補足レコード ?? undefined;
  let amountInputElement: HTMLInputElement;
  let title = resolveTitle();
  let showUneven = false;
  let showAdditionals = false;
  let futanKubun: 負担区分レコード | undefined = initFutanKubun();
  let showFutanKubun = false;

  init();

  function resolveTitle(): string {
    let t = zaikei === "医療材料" ? "器材" : "薬剤";
    if (drug) {
      return `${t}編集`;
    } else {
      return `新規${t}`;
    }
  }

  function initFutanKubun() : 負担区分レコード | undefined {
    if( drug ){
      return drug.負担区分レコード;
    } else {
      let kubun: 負担区分レコード = {};
      if( kouhiList[0] ) {
        kubun.第一公費負担区分 = true;
      }
      if( kouhiList[1] ) {
        kubun.第二公費負担区分 = true;
      }
      if( kouhiList[2] ) {
        kubun.第三公費負担区分 = true;
      }
      if( kouhiList[3] ) {
        kubun.特殊公費負担区分 = true;
      }
      return Object.keys(kubun).length === 0 ? undefined : kubun;
    }
  }

  async function init() {
    if (
      drug &&
      drug.薬品レコード.薬品コード種別 === "レセプト電算処理システム用コード"
    ) {
      if (zaikei === "医療材料") {
        const kizaicode = parseInt(drug.薬品レコード.薬品コード);
        const m = await api.getKizaiMaster(kizaicode, at);
        master = {
          kind: "kizai",
          master: { code: m.kizaicode.toString(), name: m.name, unit: m.unit },
        };
      } else {
        const iyakuhincode = parseInt(drug.薬品レコード.薬品コード);
        const m = await api.getIyakuhinMaster(iyakuhincode, at);
        master = {
          kind: "iyakuhin",
          master: {
            code: m.iyakuhincode.toString(),
            name: m.name,
            unit: m.unit,
          },
        };
      }
    }
  }

  function countKouhi(
    kouhiList: [
      公費レコード | undefined,
      公費レコード | undefined,
      公費レコード | undefined,
      公費レコード | undefined,
    ]
  ): number {
    return kouhiList.reduce(
      (acc, ele) => (ele != undefined ? acc + 1 : acc),
      0
    );
  }

  function doSearchMaster() {
    if (zaikei === "医療材料") {
      const d: SearchKizaiMasterDialog = new SearchKizaiMasterDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          at,
          onEnter: (m) => {
            master = {
              kind: "kizai",
              master: {
                code: m.kizaicode.toString(),
                name: m.name,
                unit: m.unit,
              },
            };
          },
        },
      });
    } else {
      let masterZaikei: "内服" | "外用" | "すべて" = "すべて";
      if (zaikei === "内服" || zaikei === "頓服") {
        masterZaikei = "内服";
      } else if (zaikei === "外用") {
        masterZaikei = "外用";
      }
      const d: SearchIyakuhinMasterDialog = new SearchIyakuhinMasterDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          at,
          onEnter: (m) => {
            master = {
              kind: "iyakuhin",
              master: {
                code: m.iyakuhincode.toString(),
                name: m.name,
                unit: m.unit,
              },
            };
            amountInputElement?.focus();
          },
          masterZaikei,
        },
      });
    }
  }

  function doEnter() {
    if (!master) {
      alert("薬品名が設定されていません。");
      return;
    }
    amount = toHankaku(amount.trim());
    if (!/^\d+$|^\d+\.\d+$/.test(amount)) {
      alert("分量の入力が不適切です。");
      return;
    }

    const record: 薬品レコード = {
      情報区分: master.kind === "iyakuhin" ? "医薬品" : "医療材料",
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: master.master.code,
      薬品名称: master.master.name,
      分量: amount,
      力価フラグ: "薬価単位",
      単位名: master.master.unit,
    };
    const drug: 薬品情報 = {
      薬品レコード: record,
      不均等レコード: unevenRecord,
      薬品補足レコード: additionals,
      負担区分レコード: futanKubun,
    };
    destroy();
    onEnter(drug);
  }

  function doDelete() {
    if (drug && onDelete && confirm("この薬剤を削除していいですか？")) {
      destroy();
      onDelete();
    }
  }

  function doToggleUneven() {
    showUneven = !showUneven;
  }

  function doSetUneven(rec: 不均等レコード | undefined) {
    unevenRecord = rec;
    showUneven = false;
  }

  function doToggleAdditionals() {
    showAdditionals = !showAdditionals;
  }

  function doSetAdditionals(recs: 薬品補足レコード[] | undefined) {
    additionals = recs;
    showAdditionals = false;
  }

  function doToggleFutanKubun() {
    showFutanKubun = !showFutanKubun;
  }

  function doSetFutanKubun(rec: 負担区分レコード | undefined) {
    futanKubun = rec;
    showFutanKubun = false;
  }
</script>

<Dialog {title} {destroy}>
  <div class="form-grid">
    <div style="text-align:right">
      {zaikei === "医療材料" ? "器材" : "薬剤"}名：
    </div>
    <div>
      {master ? master.master.name : "（未設定）"}
      <a
        href="javascript:void(0)"
        on:click={doSearchMaster}
        style="white-space:nowrap;font-size:0.9rem">マスター検索</a
      >
    </div>
    <div style="text-align:right">分量：</div>
    <div>
      <input
        type="text"
        bind:value={amount}
        style="width:2em;"
        bind:this={amountInputElement}
      />
      {master ? master.master.unit : ""}
      {#if unevenRecord}({unevenDisp(unevenRecord)}){/if}
      {#if additionals}{additionals
          .map((rec) => rec.薬品補足情報)
          .join(" ")}{/if}
    </div>
  </div>
  <div style="margin-top:4px;">
    <a href="javascript:void(0)" on:click={doToggleUneven}>不均等</a>
    <a href="javascript:void(0)" on:click={doToggleAdditionals}>補足</a>
    {#if countKouhi(kouhiList) > 0}
      <a href="javascript:void(0)" on:click={doToggleFutanKubun}>負担区分</a>
    {/if}
  </div>
  {#if showUneven}<UnevenForm
      orig={drug?.不均等レコード}
      onEnter={doSetUneven}
    />{/if}
  {#if showAdditionals}<DrugAdditionalsForm
      records={drug?.薬品補足レコード}
      onEnter={doSetAdditionals}
    />{/if}
  {#if showFutanKubun}<FutanKubunForm {futanKubun} {kouhiList}  onEnter={doSetFutanKubun}/>{/if}
  <div style="margin-top:10px;text-align:right;">
    {#if drug && onDelete}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    <button on:click={doEnter} disabled={!(master && amount)}
      >{drug ? "入力" : "追加"}</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .form-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
