<script lang="ts">
  import * as kanjidate from "kanjidate";
  import {
    currentVisitId,
    tempVisitId,
    setTempVisitId,
    clearTempVisitId,
    addToMishuuList,
  } from "../exam-vars";
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import FutanWariOverrideDialog from "./FutanWariOverrideDialog.svelte";
  import type { Kouhi, VisitAttributes, VisitEx } from "myclinic-model";
  import { popupTrigger } from "@/lib/popup-helper";
  import HokengaiDialog from "./HokengaiDialog.svelte";
  import {
    type Meisai,
    MeisaiWrapper,
    calcRezeptMeisai,
    totalTenOfMeisaiItems,
  } from "@/lib/rezept-meisai";
  import { resolveKouhiPayer } from "@/lib/resolve-payer";
  import { createShinryoumeisaishoData } from "./title/shinryoumeisaisho";
  import { drawShinryoumeisaisho } from "@/lib/drawer/forms/shinryoumeisaisho/shinryoumeisaisho-drawer";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";

  export let visit: VisitEx;

  let showMeisai = false;
  let hasNanbyou: boolean = hasNanbyouKouhi(visit.hoken.kouhiList);

  function hasNanbyouKouhi(kouhiList: Kouhi[]): boolean {
    for (const kouhi of kouhiList) {
      const payer = resolveKouhiPayer(kouhi, {});
      if (payer.getKind() === "nanbyou") {
        return true;
      }
    }
    return false;
  }

  function doDeleteVisit(): void {
    api.deleteVisit(visit.visitId);
  }

  function doSetTempVisitId(): void {
    setTempVisitId(visit.visitId, alert);
  }

  function doClearTempVisitId(): void {
    clearTempVisitId();
  }

  async function doMeisai() {
    showMeisai = true;
  }

  function doFutanwariOverride() {
    const d: FutanWariOverrideDialog = new FutanWariOverrideDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        visit,
      },
    });
  }

  function doMishuuList(): void {
    addToMishuuList(visit);
  }

  function isMishuu(visit: VisitEx): boolean {
    const charge = visit.chargeOption?.charge;
    const pay = visit.lastPayment?.amount;
    return charge != null && charge > 0 && (pay == null || pay === 0);
  }

  function totalTenOf(meisai: Meisai): string {
    return totalTenOfMeisaiItems(meisai.items).toLocaleString();
  }

  async function updateVisitAttributes(attr: VisitAttributes) {
    const origVisit = await api.getVisit(visit.visitId);
    origVisit.attributesStore = JSON.stringify(attr);
    await api.updateVisit(origVisit);
    visit.attributesStore = origVisit.attributesStore;
  }

  function doHokengai() {
    const attrs = visit.attributes;
    const hokengai: string[] = attrs?.hokengai ?? [];

    const d: HokengaiDialog = new HokengaiDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hokengai,
        onEnter: async (entered: string[]) => {
          const newAttr = Object.assign({}, attrs, { hokengai: entered });
          await updateVisitAttributes(newAttr);
        },
      },
    });
  }

  async function doNanbyouGendogaku() {
    const gendo = prompt(
      "難病限度額",
      visit.attributes?.nanbyouGendogaku?.toString() ?? ""
    );
    if (gendo == null) {
      return;
    }
    const gendogaku: number | undefined =
      gendo === "" ? undefined : parseInt(gendo);
    if (gendogaku !== undefined && isNaN(gendogaku)) {
      alert("Invalid number");
      return;
    }
    const attr: VisitAttributes = Object.assign({}, visit.attributes);
    attr.nanbyouGendogaku = gendogaku;
    await updateVisitAttributes(attr);
  }

  async function doIssueShinryouMeisai() {
    const shinryouList = visit.shinryouList;
    const conducts = visit.conducts;
    const clinicInfo = await api.getClinicInfo();
    const data = createShinryoumeisaishoData(visit, clinicInfo);
    const pages = drawShinryoumeisaisho(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        pages,
      },
    });
  }

  async function doReceiptName() {
    const name = prompt("領収書宛名（患者名にする場合は空白を、空白にする場合はスペースを入力）");
    if (name === undefined) {
      return;
    }
    if (name === "") {
      const v = await api.getVisit(visit.visitId);
      const attr = Object.assign(JSON.parse(v.attributesStore ?? "{}"), {
        cashierReceiptName: undefined,
      });
      v.attributesStore = JSON.stringify(attr);
      await api.updateVisit(v);
      visit.attributesStore = attr;
    } else {
      const v = await api.getVisit(visit.visitId);
      const attr = Object.assign(JSON.parse(v.attributesStore ?? "{}"), {
        cashierReceiptName: name,
      });
      v.attributesStore = JSON.stringify(attr);
      await api.updateVisit(v);
      visit.attributesStore = attr;
    }
  }

  function composeMenu(): [string, () => void][] {
    const m: [string, () => void][] = [];
    function add(label: string, action: () => void) {
      m.push([label, action]);
    }
    add("この診察を削除", doDeleteVisit);
    if (visit.visitId !== $tempVisitId) {
      add("暫定診察に設定", doSetTempVisitId);
    } else {
      add("暫定診察の解除", doClearTempVisitId);
    }
    add("診療明細", doMeisai);
    // add("負担割オーバーライド", doFutanwariOverride);
    if (isMishuu(visit)) {
      add("未収リストへ", doMishuuList);
    }
    if (hasNanbyou) {
      add("難病限度額設定", doNanbyouGendogaku);
    }
    add("保険外", doHokengai);
    add("診療明細書発行", doIssueShinryouMeisai);
    add("領収書宛名", doReceiptName);
    return m;
  }
</script>

<div
  class="top"
  class:current={visit.visitId === $currentVisitId}
  class:temp-visit={visit.visitId === $tempVisitId}
>
  <span class="datetime">{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span
  >
  <a href="javascript:void(0)" on:click={popupTrigger(() => composeMenu())}
    >操作</a
  >
</div>

{#if showMeisai}
  <Dialog destroy={() => (showMeisai = false)} title="診療明細">
    <div class="meisai-top">
      <!-- {#await api.getMeisai(visit.visitId) then meisai} -->
      {#await calcRezeptMeisai(visit.visitId) then meisai}
        {@const grouped = new MeisaiWrapper(meisai).getGrouped()}
        {#each grouped.keys() as section}
          <div>
            <div>{section}</div>
            {#each grouped.get(section)?.items ?? [] as entry}
              <div class="meisai-detail-item-row">
                <div class="meisai-detail-item label">{entry.label}</div>
                <div class="meisai-detail-item tanka-count">
                  {entry.ten.toLocaleString()}x{entry.count.toLocaleString()}
                </div>
                <div class="meisai-detail-item subtotal">
                  {(entry.ten * entry.count).toLocaleString()}
                </div>
              </div>
            {/each}
          </div>
        {/each}
        <hr />
        <div class="meisai-detail-summary">
          <span>総点：{totalTenOf(meisai)}点</span>
          <span>負担割：{meisai.futanWari.toLocaleString()}割</span>
          <span>自己負担：{meisai.charge.toLocaleString()}円</span>
        </div>
      {/await}
      <div class="commands">
        <button on:click={() => (showMeisai = false)}>閉じる</button>
      </div>
    </div>
  </Dialog>
{/if}

<style>
  .top {
    padding: 3px 6px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .top.current {
    background-color: #ff9;
  }

  .top.temp-visit {
    background-color: #9ff;
  }

  .datetime {
    font-weight: bold;
  }

  .meisai-detail-item.label {
    max-width: 16em;
  }

  .meisai-detail-item-row {
    margin-left: 1em;
    display: flex;
  }

  .meisai-detail-item {
    display: inline-block;
    width: 100%;
  }

  .meisai-detail-item.tanka-count {
    width: 4em;
    text-align: right;
    margin-right: 4px;
  }

  .meisai-detail-item.subtotal {
    width: 3em;
    text-align: right;
  }

  .meisai-detail-summary span {
    margin-right: 1em;
  }

  .meisai-top {
    margin: 10px;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 4px;
    line-height: 1;
  }
</style>
