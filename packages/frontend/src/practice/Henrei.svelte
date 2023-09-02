<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import {
    pad,
  } from "myclinic-rezept/helper";

  export let isVisible: boolean;
  let shiharaiKikan: "shaho" | "kokuho" = "shaho";
  let seikyuuYearMonth: string = defaultSeikyuuYearMonth();
  let henreiData: string = "";
  let seikyuuFile: string = "";
  let henreiReason: string = "";
  let seikyuuData: string = "";
  let seikyuuTail: string = "";
  let downloadLink: HTMLAnchorElement;
  let nopHref = "javascript:void(0)";

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
  }

  function defaultSeikyuuYearMonth(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1, 2, "0");
    return `${y}${m}`;
  }

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

  function rezeptSouten(rows: string[]): number {
    return rows.reduce((prev, ele) => {
      if (
        ele.startsWith("SI") ||
        ele.startsWith("IY") ||
        ele.startsWith("TO")
      ) {
        let values = ele.split(",");
        let tenValue = values[5];
        if (tenValue === "") {
          return prev;
        }
        let ten = parseInt(tenValue);
        let count = parseInt(values[6]);
        return prev + ten * count;
      } else {
        return prev;
      }
    }, 0);
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
  <div class="area">
    請求月：<input type="text" bind:value={seikyuuYearMonth} />
  </div>
  <textarea bind:value={henreiData} class="import-data" />
  <button on:click={doImport}>取込</button>
  <div class="area">{seikyuuFile}</div>
  {#if henreiReason !== ""}
    <div class="area reason-area">{henreiReason}</div>
  {/if}
  <div class="area">
    <textarea bind:value={seikyuuData} class="seikyuu-data" />
    <pre class="seikyuu-tail">{seikyuuTail}</pre>
    <button on:click={doCreate}>作成</button>
  </div>
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
</style>
