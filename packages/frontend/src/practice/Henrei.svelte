<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo } from "myclinic-model";
  import { 診査支払い機関コード } from "myclinic-rezept/codes";
  import { extract都道府県コードfromAddress, pad } from "myclinic-rezept/helper";
  import Rezept from "./Rezept.svelte";

  export let isVisible: boolean;
  let shiharaiKikan: "shaho" | "kokuho" = "shaho";
  let seikyuuYearMonth: string = defaultSeikyuuYearMonth();
  let henreiData: string = "";
  let seikyuuFile: string = "";
  let seikyuuData: string = "";
  let seikyuuTail: string = "";
  let rezepts: [string, string[]][] = [];
  let downloadLink: HTMLAnchorElement;

  function defaultSeikyuuYearMonth(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1, 2, "0");
    return `${y}${m}`;
  }

  function rezeptCount(): number {
    return rezepts.length;
  }

  function rezeptSouten(): number {
    return rezepts.flatMap(item => item[1]).reduce((prev, ele) => {
      if( ele.startsWith("SI") || ele.startsWith("IY") || ele.startsWith("TO") ){
        let values = ele.split(",");
        let ten = parseInt(values[5]);
        let count = parseInt(values[6]);
        return prev + ten * count;
      } else {
        return prev;
      }
    }, 0);
  }

  function doImport() {
    if (henreiData === "") {
      return;
    }
    let [seikyuu, tail] = parseHenreiData(henreiData);
    henreiData = "";
    seikyuuData = seikyuu.join("\n");
    seikyuuTail = tail.join("\n");
  }

  function parseHenreiData(data: string): [string[], string[]] {
    const rows = henreiData.split(/\r?\n/).filter((s) => s !== "");
    let seikyuu: string[] = [];
    let tail: string[] = [];
    let isSeikyuu = true;
    for (let row of rows) {
      if (row.startsWith("HR")) {
        isSeikyuu = false;
      }
      (isSeikyuu ? seikyuu : tail).push(row);
    }
    seikyuuFile = mkFileName(seikyuu[0]);
    return [seikyuu, tail];
  }

  function doAdd() {
    let seikyuuRows: string[] = seikyuuData.split("\n");
    let tailRows: string[] = seikyuuTail.split("\n");
    let line = seikyuuRows[0];
    if (!line.startsWith("RE")) {
      alert("Invalid Seikyuu first row ('RE' expected).");
      return;
    }
    let values = line.split(",");
    let ym = values[3];
    let name = values[4];
    name = name.replaceAll(" ", "");
    name = name.replaceAll("　", "");
    let patientId = values[13];
    let file = `henrei-${ym}-${name}-${patientId}.csv`;
    rezepts = [[file, [...seikyuuRows, ...tailRows]], ...rezepts];
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

  async function doCreate() {
    let text = (await mkClinicInfoRecord()) + "\r\n";
    text += rezepts.flatMap((item) => item[1]).join("\r\n") + "\r\n";
    text += mkGoukeiRecord() + "\r\n";
    text += "\x1A";
    const file = new Blob([text], { type: "text/plain" });
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = "RECEIPTC.HEN";
  }

  async function mkClinicInfoRecord() {
    const clinicInfo: ClinicInfo = await api.getClinicInfo();
    return [
      "HI",
      shiharaiKikan === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,
      seikyuuYearMonth,
      extract都道府県コードfromAddress(clinicInfo.address),
      1,
      clinicInfo.kikancode,
      "",
      "00"
    ].join(",");
  }

  function mkGoukeiRecord() {
    return [
    "GO",
    rezeptCount(),
    rezeptSouten(),
    "99"
    ].join(",");
  }

</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="返戻" />
  <div class="shiharai-kikan-area">
    <form on:submit|preventDefault={() => {}}>
      <input type="radio" bind:group={shiharaiKikan} value="shaho"> 社保
      <input type="radio" bind:group={shiharaiKikan} value="kokuho"> 国保
    </form>
  </div>
  <div class="seikyuu-month-area">
    請求月：<input type="text" bind:value={seikyuuYearMonth} />
  </div>
  <textarea bind:value={henreiData} class="import-data" />
  <button on:click={doImport}>取込</button>
  <div class="seikyuu-area">
    <div>{seikyuuFile}</div>
    <textarea bind:value={seikyuuData} class="seikyuu-data" />
    <pre class="seikyuu-tail">{seikyuuTail}</pre>
    <button on:click={doAdd}>追加</button>
  </div>
  <div class="rezept-area">
    <div>
      {#each rezepts.map((item) => item[0]) as file}
        <div>{file}</div>
      {/each}
    </div>
    <div>
      <button on:click={doCreate}>作成</button>
    </div>
    <div>
        <a bind:this={downloadLink}>Download</a>
    </div>
  </div>
</div>

<style>
  .import-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .shiharai-kikan-area,
  .seikyuu-month-area,
  .seikyuu-area,
  .rezept-area {
    margin: 10px 0;
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
