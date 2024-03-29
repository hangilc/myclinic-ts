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
  import { drawSeal8x3 } from "@/lib/drawer/forms/seal8x3/sealx8x3";

  let [fromDate, uptoDate] = defaultDates(new Date());
  let labelStartRow = 1;
  let labelStartCol = 1;
  let items: FaxedShohousenItem[] = [];
  let pharmaMapCache: Record<string, PharmaData> | undefined = undefined;
  let clinicInfoCache: ClinicInfo | undefined = undefined;
  let startRow = "1";
  let startCol = "1";
  let labelStart = "1";
  let labelCount = "";

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
    labelCount = items.length.toString();
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
    window.open(`${getBackend()}/portal-tmp/${filename}`, "_blank");
  }

  async function doAddressLabel() {
    function printableItems() {
      let c = nLabelCount;
      let n = items.length;
      n -= (nLabelStart - 1);
      let m = 24 - (3 * (nStartRow - 1) + nStartCol - 1);
      return Math.min(c, n, m);
    }
    const nStartRow = parseInt(startRow);
    const nStartCol = parseInt(startCol);
    const nLabelStart = parseInt(labelStart);
    const nLabelCount = parseInt(labelCount);
    if( isNaN(nStartRow) || isNaN(nStartCol) || isNaN(nLabelStart) || isNaN(nLabelCount) ) {
      alert("Invalid input");
      return;
    }
    const pharmaMap = await getPharmaMap();
    const ctx = mkDrawerContext();
    c.createFont(ctx, "default", "MS Mincho", 3.8);
    c.setFont(ctx, "default");
    const labelItems = items.slice(nLabelStart - 1, nLabelStart - 1 + printableItems());
    console.log("items", items);
    console.log("labelItems", labelItems);
    const texts = labelItems
      .map((item) => {
        const fax = item.pharmaFax;
        const pharma = pharmaMap[fax];
        if (pharma) {
          return pharma.labelAddr;
        } else {
          alert("Cannot find address for: " + fax);
          return "";
        }
      });
    drawSeal8x3(ctx, texts, {
      startRow: nStartRow,
      startCol: nStartCol
    });
    const filename = "faxed-shohousen-pharm-addr.pdf";
    await api.createPdfFile(c.getOps(ctx), "A4", filename);
    window.open(`${getBackend()}/portal-tmp/${filename}`, "_blank");
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
    {#if items.length > 0}
      <div>{items.length}件</div>
      <div>
        {#each items as item (item.pharmaFax)}
          <div>{item.pharmaName}</div>
        {/each}
      </div>
    {/if}
  </div>
</form>

<div>
  <div>薬局レターＰＤＦ</div>
  <div>
    {#if items.length > 0}
      <div>
        <button type="button" on:click={doPharmaLetterPdf}>表示</button>
      </div>
    {/if}
  </div>
</div>

<div>
  <div>薬局住所ラベルＰＤＦ</div>
  <div>
    {#if items.length > 0}
      開始行：<input type="text" class="short-input" bind:value={startRow}/>
      開始列：<input type="text" class="short-input" bind:value={startCol}/>
      ラベル開始：<input type="text" class="short-input" bind:value={labelStart}/>
      ラベル数：<input type="text" class="short-input" bind:value={labelCount}/>
      <button type="button" on:click={doAddressLabel}>表示</button>
    {/if}
  </div>
</div>

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .label-input {
    width: 4em;
  }

  .short-input {
    width: 4em;
  }
</style>
