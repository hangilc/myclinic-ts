<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo, Visit } from "myclinic-model";
  import { listKouhi } from "./list-kouhi";
  import type { PatientUnit } from "myclinic-rezept";
  import {
    RezeptFrame,
    rezeptUnitToPatientUnit,
    type RezeptUnit,
  } from "myclinic-rezept";
  import { cvtVisitsToUnit, loadVisits, loadVisitsForPatient } from "@/lib/rezept-adapter";

  export let isVisible: boolean;
  let year: number;
  let month: number;
  let clinicInfo: ClinicInfo | undefined = undefined;
  let preShow: string | undefined = undefined;
  let shiharaiSelect: "shaho" | "kokuho" = "shaho";
  let henreiData: string = "";
  let patientFilter: string = "";

  initDate();
  initClinicInfo();

  function initDate(): void {
    let today = new Date();
    const d = today.getDate();
    if (d < 12) {
      today.setMonth(today.getMonth() - 1);
    }
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    year = y;
    month = m;
  }

  async function initClinicInfo() {
    clinicInfo = await api.getClinicInfo();
  }

  async function createContent(): Promise<string> {
    if (!clinicInfo) {
      console.error("Cannot get ClinicInfo");
      return "";
    }
    let visitsMap: { shaho: Visit[][], kokuho: Visit[][]};
    if( patientFilter !== "" ){
      const patientId = parseInt(patientFilter);
      visitsMap = await loadVisitsForPatient(year, month, patientId);
    } else {
      visitsMap = await loadVisits(year, month);
    }
    const visitsList = visitsMap[shiharaiSelect];
    const units: RezeptUnit[] = await Promise.all(
      visitsList.map((visits) => cvtVisitsToUnit(visits))
    );
    const frame = new RezeptFrame(shiharaiSelect, year, month, clinicInfo);
    for (const unit of units) {
      const patientUnit = rezeptUnitToPatientUnit(unit, year, month, {}, unit.paymentSetting);
      frame.add(patientUnit);
    }
    for (const unit of parseHenreiData()) {
      const patientUnit = henreiToPatientUnit(unit);
      frame.add(patientUnit);
    }
    frame.finish();
    return frame.output();
  }


  async function doStart() {
    preShow = await createContent();
  }

  async function doDownload() {
    const content: string = await createContent();
    const bytes: Uint8Array = new TextEncoder().encode(content);
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "RECEIPTC.UKE";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function doListKouhi() {
    const result = await listKouhi(year, month);
    const s = result
      .map((r) => {
        return `${r.patient.fullName()} (${
          r.patient.patientId
        }): ${r.kouhiList.join("、")}\n`;
      })
      .join("");
    alert(s);
  }

  function parseHenreiData(): string[][] {
    const items: string[][] = [];
    let curr: string[] = [];
    function flush() {
      if (curr.length > 0) {
        items.push(curr);
        curr = [];
      }
    }
    for (let line of henreiData.split(/\r?\n/)) {
      if (line === "") {
        continue;
      }
      if (line.startsWith("RE")) {
        flush();
      }
      curr.push(line);
    }
    flush();
    return items;
  }

  function modifyHenreiSerial(serial: number, rows: string[]): string[] {
    return rows.map(row => {
      if( row.startsWith("RE") ){
        const values = row.split(",");
        values[1] = serial.toString();
        return values.join(",");
      } else {
        return row;
      }
    });
  }

  function henreiToPatientUnit(henrei: string[]): PatientUnit {
    let hokensha: string | undefined = undefined;
    let kouhiList: string[] = [];
    let souten: number = 0;
    for (const row of henrei) {
      if (
        row.startsWith("SI") ||
        row.startsWith("IY") ||
        row.startsWith("TO")
      ) {
        let values = row.split(",");
        let tenValue = values[5];
        if (tenValue === "") {
          continue;
        }
        let ten = parseInt(tenValue);
        let count = parseInt(values[6]);
        souten += ten * count;
      } else if( row.startsWith("HO") ){
        hokensha = row;
      } else if( row.startsWith("KO") ) {
        kouhiList.push(row);
      }
    }
    return {
      getRows(serial: number): string[] {
        return modifyHenreiSerial(serial, henrei);
      },
      hasHoken(): boolean {
        return hokensha !== undefined;
      },
      getKouhiListLength(): number {
        return kouhiList.length;
      },
      getSouten(): number {
        return souten;
      }
    }
  }
</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="レセプト">
    <div class="start-block">
      <input type="text" bind:value={year} />年
      <input type="text" bind:value={month} />月
      <input type="radio" bind:group={shiharaiSelect} value="shaho" />社保
      <input type="radio" bind:group={shiharaiSelect} value="kokuho" />国保
      <button on:click={doStart}>開始</button>
      <button on:click={doDownload}>ダウンロード</button>
      <a href="javascript:void(0)" on:click={doListKouhi}>公費リスト</a>
    </div>
  </ServiceHeader>
  <div>
    Restrict <input type="text" placeholder="患者番号" bind:value={patientFilter}/>
  </div>
<div class="area henrei">
    <div>返戻</div>
    <textarea bind:value={henreiData} />
    <!-- <button on:click={doImportHenrei}>返戻取込</button> -->
  </div>
  {#if preShow !== undefined}
    <pre class="show">{preShow}</pre>
  {/if}
</div>

<style>
  .start-block {
    margin-left: 20px;
  }

  .start-block input {
    width: 4em;
  }

  input[type="radio"] {
    width: auto;
  }

  .area {
    margin: 10px 0;
  }

  .area.henrei textarea {
    width: 60ch;
    height: 10ch;
  }
</style>
