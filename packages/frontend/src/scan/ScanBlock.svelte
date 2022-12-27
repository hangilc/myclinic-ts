<script lang="ts">
  import { confirm } from "@/lib/confirm-call";
  import Confirm from "@/lib/Confirm.svelte";
  import { printApi, type ScannerDevice } from "@/lib/printApi";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { makePatientText, makeScannerText } from "./misc";
  import { ScanManager } from "./scan-manager";
  import {
    scannerProbed,
  } from "./scan-vars";
  import ScanKindPulldown from "./ScanKindPulldown.svelte";
  import { UploadStatus, type ScannedDocData } from "./scanned-doc-data";
  import ScannedDoc from "./ScannedDoc.svelte";
  import ScanProgress from "./ScanProgress.svelte";
  import SelectScannerPulldown from "./SelectScannerPulldown.svelte";

  export let remove: () => void;

  let manager = new ScanManager();
  let patientText: string = makePatientText(manager.patient);
  let kindText: string = manager.kindKey;
  let scannerText: string = makeScannerText(manager.scanDevice);
  let scannerList: ScannerDevice[] = [];
  let scannedDocs: ScannedDocData[] = [];
  let canScan: Writable<boolean> = writable(false);
  let isScanning: boolean = false;
  let scanPct: number = 0;
  let canUpload: boolean = false;

  manager.onPatientChange = (p: Patient) => {
    patientText = makePatientText(p);
  };

  manager.onScannableChange = (available: boolean) => canScan.set(available);
  manager.onScannerChange = (scanner: ScannerDevice | undefined) => {
    scannerText = makeScannerText(scanner);
  };

  manager.onKindKeyChange = (key: string) => kindText = key;

  manager.onDocsChange = docs => {
    scannedDocs = docs;
    canUpload = hasUnUploaded(docs);
  }
  manager.onScanStart = () => isScanning = true;
  manager.onScanEnd = () => isScanning = false;
  manager.onScanPctChange = pct => scanPct = pct;

  probeScanner();

  async function probeScanner() {
    const result = await printApi.listScannerDevices();
    for (const r of result) {
      scannerProbed(r.deviceId);
    }
    scannerList = result;
    if (result.length >= 1) {
      manager.setDevice(result[0]);
    }
  }

  function hasUnUploaded(docs: ScannedDocData[]): boolean {
    for (let doc of docs) {
      if (doc.uploadStatus !== UploadStatus.Success) {
        return true;
      }
    }
    return false;
  }

  function doSearchPatient(): void {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者検索（スキャン）",
        onEnter: (p: Patient) => {
          manager.setPatient(p);
        },
      },
    });
  }

  function doSelectKind(event: MouseEvent): void {
    const d: ScanKindPulldown = new ScanKindPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: event.target as HTMLElement,
        onEnter: (k: string) => manager.setKindKey(k),
      },
    });
  }

  // async function scan(): Promise<string | undefined> {
  //   const scanner = manager.scanDevice;
  //   if (scanner == undefined) {
  //     alert("スキャナーが設定されていません。");
  //     return;
  //   }
  //   return await startScan(scanner.deviceId, isScanning, scanPct);
  // }

  function doStartScan(): void {
    manager.scan();

    // const patient = manager.patient;
    // if (patient == undefined) {
    //   alert("患者が設定されていません。");
    //   return;
    // }
    // const scanner = manager.scanDevice;
    // if (scanner == undefined) {
    //   alert("スキャナーが設定されていません。");
    //   return;
    // }
    // const kindValue = manager.scanKind;
    // const imageFile = await scan();
    // if (imageFile != undefined) {
    //   const index = $scannedDocs.length + 1;
    //   const data = new ScannedDocData(
    //     imageFile,
    //     patient.patientId,
    //     kindValue,
    //     getScanDate(),
    //     index
    //   );
    //   updateDocs([...$scannedDocs, data]);
    // }
  }

  async function doRescan(data: ScannedDocData) {
    manager.reScan(data);
  }

  async function doDelete(data: ScannedDocData) {
    confirm("このスキャン文書を削除しますか？", () => manager.deleteDoc(data));
  }

  async function doUpload() {
    manager.upload();
  }

  function deleteScannedImages() {
    manager.deleteScannedImages();
    // const promises = $scannedDocs.map((doc) =>
    //   printApi.deleteScannedFile(doc.scannedImageFile)
    // );
    // Promise.all(promises);
  }

  function doClose(): void {
    function close(): void {
      deleteScannedImages();
      remove();
    }
    if (canUpload) {
      confirm(
        "アップロードされていないファイルがありますが、閉じますか？",
        close
      );
    } else {
      close();
    }
  }

  function doSelectScanner(event: MouseEvent): void {
    const d: SelectScannerPulldown = new SelectScannerPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: event.target as HTMLElement,
        list: scannerList,
        current: manager.scanDevice,
        onSelect: (device: ScannerDevice) => {
          manager.setDevice(device);
        }
      }
    })
  }
</script>

<div class="top">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work">
    {patientText}
    <button on:click={doSearchPatient}>検索</button>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    {kindText}
    <a
      href="javascript:void(0)"
      on:click={doSelectKind}>選択</a
    >
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    {scannerText}
    <a href="javascript:void(0)" on:click={doSelectScanner}>選択</a>
  </div>
  <div class="commands">
    <button on:click={doStartScan} disabled={!$canScan}>スキャン開始</button>
    {#if isScanning}
      <ScanProgress pct={scanPct} />
    {/if}
  </div>
  <div class="title">スキャン文書</div>
  <div class="work">
    {#each scannedDocs as doc (doc.id)}
      <ScannedDoc data={doc} {canScan} onRescan={doRescan} onDelete={doDelete}/>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doUpload} disabled={!canUpload}
      >アップロード</button
    ><button on:click={doClose}>閉じる</button>
  </div>
</div>

<style>
  .top {
    margin: 10px;
    padding: 10px;
    border: 1px solid gray;
  }

  .title {
    font-weight: bold;
    margin: 10px 0;
  }

  .main {
    font-size: 1.2rem;
  }

  .work {
    margin: 0 10px;
  }

  .commands {
    margin: 10px 0;
  }

  * + button {
    margin-left: 4px;
  }
</style>
