<script lang="ts">
  import { Kouhi, Text } from "myclinic-model";
  import { TextMemoWrapper, type ShohouTextMemo } from "@/lib/text-memo";
  import api from "@/lib/api";
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import type { Unsubscriber } from "svelte/store";
  import { textUpdated } from "@/app-events";
  import { onDestroy } from "svelte";
  import ShohouTextForm from "./ShohouTextForm.svelte";
  import RegisteredShohouForm from "./RegisteredShohouForm.svelte";
  import { DateWrapper } from "myclinic-util";
  import { ippanmeiStateFromMaster } from "@/lib/denshi-shohou/denshi-shohou-form/denshi-shohou-form-types";

  export let text: Text;
  export let at: string;
  export let kouhiList: Kouhi[];
  export let patientId: number;
  let textId = text.textId;
  let memo: ShohouTextMemo = TextMemoWrapper.getShohouMemo(text);
  let shohou: PrescInfoData = memo.shohou;
  let prescriptionId: string | undefined = memo.prescriptionId;
  let mode: "disp" | "edit" = "disp";
  let prolog = `院外処方（電子${prescriptionId ? "登録" : ""}）`;
  let ippanRep = "";
  let ippanDrugs: {
    drugName: string;
    ippanKind: "一般名" | "一般名有り" | "";
  }[] = [];

  let unsubs: Unsubscriber[] = [
    textUpdated.subscribe((updated) => {
      if (updated && updated.textId === textId) {
        const newMemo = TextMemoWrapper.fromText(updated).probeShohouMemo();
        if (newMemo) {
          memo = newMemo;
          shohou = memo.shohou;
          prescriptionId = memo.prescriptionId;
        }
      }
    }),
  ];

  onDestroy(() => unsubs.forEach((f) => f()));

  $: adaptToText(text);
  $: setupIppan(shohou);

  function adaptToText(text: Text) {
    memo = TextMemoWrapper.getShohouMemo(text);
    shohou = memo.shohou;
    console.log("shohou", shohou);
    prescriptionId = memo.prescriptionId;
    prolog = `院外処方（電子${prescriptionId ? "登録" : ""}）`;
  }

  function isToday(): boolean {
    return at === DateWrapper.from(new Date()).asSqlDate();
  }

  async function setupIppan(shohou: PrescInfoData) {
    if (isToday()) {
      ippanDrugs = [];
      const drugGroups = shohou.RP剤情報グループ;
      for (let g of drugGroups) {
        for (let r of g.薬品情報グループ) {
          const codeKind = r.薬品レコード.薬品コード種別;
          const code = r.薬品レコード.薬品コード;
          const drugName = r.薬品レコード.薬品名称;
          let ippanKind: "一般名" | "一般名有り" | "" = "";
          if (codeKind === "一般名コード") {
            ippanKind = "一般名";
          } else if (codeKind === "レセプト電算処理システム用コード") {
            const m = await api.getIyakuhinMaster(parseInt(code), at);
            const s = ippanmeiStateFromMaster(m);
            if (s.kind === "has-ippanmei") {
              ippanKind = "一般名有り";
            } else if (s.kind === "has-no-ippanmei") {
              ippanKind = "";
            }
          }
          ippanDrugs.push({ drugName, ippanKind });
        }
      }
    }
    let nIppan = 0;
    let nHasIppan = 0;
    for (let d of ippanDrugs) {
      if (d.ippanKind === "一般名有り") {
        nHasIppan += 1;
      } else if (d.ippanKind === "一般名") {
        nIppan += 1;
      }
    }
    if (nIppan >= 2 && nHasIppan === 0) {
      ippanRep = "一般名加算１";
    } else if (nIppan > 0) {
      ippanRep = "一般名加算２";
    }
  }

  async function doShohouModified(modified: PrescInfoData) {
    let m = TextMemoWrapper.fromText(text).probeShohouMemo();
    if (m && m.prescriptionId) {
      console.error("cannot modify registered denshi shohou");
      return;
    }
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou: modified,
      prescriptionId: undefined,
    });
    await api.updateText(text);
    mode = "disp";
  }

  async function doRegistered(shohou: PrescInfoData, prescriptionId: string) {
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou,
      prescriptionId: prescriptionId,
    });
    await api.updateText(text);
    mode = "disp";
    text = text;
    // adaptToText(text);
  }

  async function doUnregistered() {
    shohou.引換番号 = undefined;
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou,
      prescriptionId: undefined,
    });
    await api.updateText(text);
    mode = "disp";
    text = text;
    // adaptToText(text);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div style="margin-bottom:10px;">
  {#if mode === "disp"}
    <div style="cursor:pointer;" on:click={() => (mode = "edit")}>
      <DenshiShohouDisp {shohou} {prolog} {prescriptionId} />
    </div>
    <div>{ippanRep}</div>
  {:else if mode === "edit"}
    {#if prescriptionId}
      <RegisteredShohouForm
        {shohou}
        {prescriptionId}
        onCancel={() => (mode = "disp")}
        textId={text.textId}
        onUnregistered={doUnregistered}
        onDone={() => (mode = "disp")}
        onCopied={() => (mode = "disp")}
      />
    {:else}
      <div>
        <ShohouTextForm
          {shohou}
          {at}
          {kouhiList}
          {textId}
          {patientId}
          onCancel={() => (mode = "disp")}
          onDone={() => (mode = "disp")}
          onModified={doShohouModified}
          onRegistered={doRegistered}
          onCopied={() => (mode = "disp")}
        />
      </div>
    {/if}
  {/if}
</div>
