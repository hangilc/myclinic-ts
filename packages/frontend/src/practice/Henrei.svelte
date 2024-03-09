<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { cvtVisitsToUnit, loadVisitsForPatient } from "@/lib/rezept-adapter";
  import type { Visit } from "myclinic-model";
  import { rezeptUnitToPatientUnit } from "myclinic-rezept";
  import DiffMatchPatch from "diff-match-patch";

  export let isVisible: boolean;
  let shiharaiKikan: "shaho" | "kokuho" = "shaho";
  // let seikyuuYearMonth: string = defaultSeikyuuYearMonth();
  let henreiData: string = "";
  let seikyuuFile: string = "";
  let henreiReason: string = "";
  let seikyuuData: string = "";
  let seikyuuTail: string = "";
  let downloadLink: HTMLAnchorElement;
  let nopHref = "javascript:void(0)";
  let diffs: DiffMatchPatch.Diff[] = [];

  function doReset() {
    henreiData = "";
    seikyuuFile = "";
    henreiReason = "";
    seikyuuData = "";
    seikyuuTail = "";
    const href = downloadLink.href;
    downloadLink.href = "";
    if (href !== nopHref) {
      URL.revokeObjectURL(href);
    }
    diffs = [];
  }

  // function defaultSeikyuuYearMonth(): string {
  //   const d = new Date();
  //   const y = d.getFullYear();
  //   const m = pad(d.getMonth() + 1, 2, "0");
  //   return `${y}${m}`;
  // }

  function doImport() {
    if (henreiData === "") {
      return;
    }
    let [seikyuu, tail] = parseHenreiData(henreiData);
    seikyuuData = seikyuu.join("\n");
    seikyuuTail = tail.join("\n");
  }

  function mkFileName(line: string): string {
    if (!line.startsWith("RE")) {
      throw new Error("Invalid Seikyuu first row ('RE' expected).");
    }
    let values = line.split(",");
    let ym = values[3];
    let name = values[4];
    name = name.replaceAll(" ", "");
    name = name.replaceAll("　", "");
    let patientId = values[13];
    return `henrei-${ym}-${name}-${patientId}.csv`;
  }

  function addToFileName(fileName: string, postfix: string): string {
    const i = fileName.lastIndexOf(".");
    if (i >= 0) {
      return fileName.substring(0, i) + postfix + fileName.substring(i);
    } else {
      return fileName + postfix;
    }
  }

  function parseHenreiData(data: string): [string[], string[]] {
    const rows = henreiData.split(/\r?\n/).filter((s) => s !== "");
    let seikyuu: string[] = [];
    let tail: string[] = [];
    let isSeikyuu = true;
    for (let row of rows) {
      if (row.startsWith("HR")) {
        henreiReason = row;
        isSeikyuu = false;
        continue;
      }
      (isSeikyuu ? seikyuu : tail).push(row);
    }
    seikyuuFile = mkFileName(seikyuu[0]);
    return [seikyuu, tail];
  }

  async function doCreate() {
    let seikyuuRows: string[] = seikyuuData.split(/\r?\n/);
    let tailRows: string[] = seikyuuTail.split(/\r?\n/);
    let fixedFileName = addToFileName(seikyuuFile, "-fixed");
    let text = [...seikyuuRows, ...tailRows].join("\r\n") + "\r\n";
    const file = new Blob([text], { type: "text/plain" });
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = fixedFileName;
  }

  function parseSeikyuu(src: string): { year: number, month: number, patientId: number, serial: number, searchNumber: number } {
    const lines: string[] = src.split(/\r?\n/);
    for(let line of lines){
      if( line.startsWith("RE") ){
        const toks = line.split(",");
        const item = toks[3];
        return {
          year: parseInt(item.substring(0, 4)),
          month: parseInt(item.substring(4, 6)),
          patientId: parseInt(toks[13]),
          serial: parseInt(toks[1]),
          searchNumber: parseInt(toks[18]),
        }
      }
    }
    throw new Error("Cannot find RE record.");
  }

  async function doRecalc() {
    const { year, month, patientId, serial, searchNumber } = parseSeikyuu(seikyuuData);
    const { shaho, kokuho } = await loadVisitsForPatient(year, month, patientId);
    let visits: Visit[] = [];
    if( shaho.length === 1 && kokuho.length === 0 ){
      visits = shaho[0];
    } else if( kokuho.length === 1 && shaho.length === 0 ){
      visits = kokuho[0];
    } else {
      throw new Error("Cannot handle visits");
    }
    const unit = await cvtVisitsToUnit(visits);
    const patientUnit = rezeptUnitToPatientUnit(unit, year, month, { searchNumber });
    const rows = patientUnit.getRows(serial);
    seikyuuData = rows.join("\r\n") + "\r\n";
  }

  function doDiff() {
    diffs = [];
    const [oldText] = parseHenreiData(henreiData);
    const newText = seikyuuData;
    const dmp = new DiffMatchPatch();
    diffs = dmp.diff_main(oldText.join("\n"), newText.replaceAll(/\r?\n/g, "\n"));
  }

  function diffClass(c: number): string {
    switch(c){
      case 1: return "insert";
      case -1: return "delete";
      default: return "no-change";
    }
  }

</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="返戻" />
  <div class="area">
    <form on:submit|preventDefault={() => {}}>
      <input type="radio" bind:group={shiharaiKikan} value="shaho" /> 社保
      <input type="radio" bind:group={shiharaiKikan} value="kokuho" /> 国保
    </form>
  </div>
  <!-- <div class="area">
    請求月：<input type="text" bind:value={seikyuuYearMonth} />
  </div> -->
  <textarea bind:value={henreiData} class="import-data" />
  <button on:click={doImport}>取込</button>
  <div class="area">{seikyuuFile}</div>
  {#if henreiReason !== ""}
    <div class="area reason-area">{henreiReason}</div>
  {/if}
  <div class="area">
    <textarea bind:value={seikyuuData} class="seikyuu-data" />
    <pre class="seikyuu-tail">{seikyuuTail}</pre>
    <button on:click={doRecalc}>再計算</button>
    <button on:click={doDiff}>差分</button>
    <button on:click={doCreate}>作成</button>
  </div>
  {#if diffs.length > 0}
  <div class="area diff">
    {#each diffs as d}
      {@const c = d[0]}
      {@const ss = d[1].split("\n")}
      {#each ss as s, i}
        {#if i > 0}<br />{/if}
        <span class={diffClass(c)}>{s}</span>
      {/each}
    {/each}
  </div>
  {/if}
  <div class="area">
    <a href={nopHref} bind:this={downloadLink}>Download</a>
  </div>
  <div class="area">
    <button on:click={doReset}>リセット</button>
  </div>
</div>

<style>
  .import-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .area {
    margin: 10px 0;
  }

  .reason-area {
    border: 1px solid gray;
    border-radius: 4px;
    width: 70ch;
    padding: 10px;
  }

  .seikyuu-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .seikyuu-tail {
    width: 80ch;
    overflow-x: auto;
  }

  .diff .insert {
    font-weight: bold;
    color: blue;
    background-color: rgba(0, 0, 255, 0.2);
  }

  .diff .delete {
    font-weight: bold;
    color: red;
    background-color: rgba(255, 0, 0, 0.2);
  }

  .diff .no-change {
    font: gray;
  }
</style>
