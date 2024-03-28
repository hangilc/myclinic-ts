<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import {
    defaultDates,
    probeFaxShohousen,
    type FaxShohousen,
    fetchPharmaData,
    type FaxedShohousenItem,
    type PharmaData,
    mkLetterText,
  } from "./fax-shohousen-helper";
  import api, { getBackend, getBase } from "@/lib/api";
  import { ClinicInfo, dateToSqlDate } from "myclinic-model";
  import type { Op } from "@/lib/drawer/compiler/op";
  import * as c from "@/lib/drawer/compiler/compiler";
  import * as b from "@lib/drawer/compiler/box";
  import { A4 } from "@lib/drawer/compiler/paper-size";
  import {
    mkDrawerContext,
    type DrawerContext,
  } from "@/lib/drawer/compiler/context";

  let [fromDate, uptoDate] = defaultDates(new Date());
  let labelStartRow = 1;
  let labelStartCol = 1;
  let items: FaxedShohousenItem[] = [];
  let pharmaMapCache: Record<string, PharmaData> | undefined = undefined;
  let clinicInfoCache: ClinicInfo | undefined = undefined;

  async function getPharmaMap(): Promise<Record<string, PharmaData>> {
    if (!pharmaMapCache) {
      pharmaMapCache = await fetchPharmaData();
    }
    return pharmaMapCache;
  }

  async function getClinicInfo(): Promise<ClinicInfo> {
    if (!clinicInfoCache) {
      clinicInfoCache = await api.getClinicInfo();
    }
    return clinicInfoCache;
  }

  async function doCreate() {
    const visitIds = await api.listVisitIdInDateInterval(
      dateToSqlDate(fromDate),
      dateToSqlDate(uptoDate)
    );
    const fs: FaxShohousen[] = [];
    for (let visitId of visitIds) {
      const f = await probeFaxShohousen(visitId);
      if (f) {
        fs.push(f);
      }
    }
    const byPharma: Record<string, FaxShohousen[]> = {};
    fs.forEach((f) => {
      let a: FaxShohousen[] | undefined = byPharma[f.pharma];
      if (!a) {
        a = [];
        byPharma[f.pharma] = a;
      }
      a.push(f);
    });
    items = [];
    const notFound: string[] = [];
    const pharmaMap = await getPharmaMap();
    for (const fax in byPharma) {
      const list = byPharma[fax];
      const pharma = pharmaMap[fax]?.name;
      if (!pharma && !notFound.includes(fax)) {
        notFound.push(fax);
      } else {
        const rs = list.map((f) => ({
          name: `${f.patient.lastName}${f.patient.firstName}`,
          visitedAt: f.visitedAt,
        }));
        items.push({ pharmaName: pharma, pharmaFax: fax, records: rs });
      }
    }
    if (notFound.length > 0) {
      alert("Unrsolved pharmacy fax: " + notFound.join(", "));
    }
    items.sort((a, b) => b.records.length - a.records.length);
    items = items;
  }

  async function doPharmaLetterPdf() {
    const clinicInfo = await getClinicInfo();
    const pages: string[][] = items.map((item) => {
      return mkLetterText(
        item.pharmaName,
        fromDate,
        uptoDate,
        item.records,
        clinicInfo
      );
    });
    const paperBox = b.paperSizeToBox(A4);
    const drawBox = b.modify(paperBox, b.inset(20));
    const opsList: Op[][] = pages.map((lines) => {
      let ctx: DrawerContext = mkDrawerContext();
      c.createFont(ctx, "default", "MS Gothic", 4);
      c.setFont(ctx, "default");
      c.paragraph(ctx, lines.join("\n"), drawBox, { leading: 1 });
      return c.getOps(ctx);
    });
    const filename = "faxed-shohousen-pharma-letter.pdf";
    await api.createMultiPagePdfFile(opsList, "A4", filename);
    window.open(`${getBackend()}/portal-tmp/${filename}`, "_blank")
  }
</script>

<div class="title">ファックス済処方箋</div>
<form>
  <div>
    <span>開始日</span>
    <EditableDate date={fromDate} />
    <span class="ml-2">終了日</span>
    <EditableDate date={uptoDate} />
  </div>
  <div>
    <span>ラベル開始</span>
    <label>行</label>
    <input type="number" class="label-input" bind:value={labelStartRow} />
    <label>列</label>
    <input type="number" class="label-input" bind:value={labelStartCol} />
  </div>
  <div class="form-inline mt-2">
    <button type="button" on:click={doCreate}>すべて作成</button>
  </div>
</form>

<div>
  <div>薬局レターＰＤＦ</div>
  <div class="card-body">
    {#if items.length > 0}
      <div>
        <button type="button" on:click={doPharmaLetterPdf}>表示</button>
      </div>
    {/if}
  </div>
</div>

<div id="faxed-pharma-label-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">薬局住所ラベルＰＤＦ</div>
  <div class="card-body">
    <div class="faxed-part-message"></div>
    <div class="form-inline mt-2">
      <button type="button" class="btn btn-link faxed-part-create">作成</button>
      <button type="button" class="btn btn-link faxed-part-display">表示</button
      >
    </div>
  </div>
</div>

<div id="faxed-clinic-label-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">クリニック住所ラベルＰＤＦ</div>
  <div class="card-body">
    <div class="faxed-part-message"></div>
    <div class="form-inline mt-2">
      <button type="button" class="btn btn-link faxed-part-create">作成</button>
      <button type="button" class="btn btn-link faxed-part-display">表示</button
      >
    </div>
  </div>
</div>

<ul class="nav nav-tabs mt-3">
  <li class="nav-item">
    <a class="nav-link faxed-part-prev-groups" href="javascript:void(0)"
      >処理済一覧</a
    >
  </li>
</ul>
<div id="faxed-nav-content-prev-groups" class="faxed-nav-content d-none"></div>

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .label-input {
    width: 4em;
  }
</style>
