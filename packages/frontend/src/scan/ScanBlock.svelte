<script lang="ts">
  import { printApi, type ScannerDevice } from "@/lib/printApi";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import ScanKindPulldown from "./ScanKindPulldown.svelte";

  let patient: Writable<Patient | undefined> = writable(undefined);
  let kind: Writable<string | undefined> = writable(undefined);
  let scanner: Writable<ScannerDevice | undefined> = writable(undefined);
  let selectKindLink: HTMLElement;
  let kindValue = "";

  probeScanner();

  async function probeScanner() {
    const result = await printApi.listScannerDevices();
    if( result.length === 1 ){
      scanner.set(result[0]);
    }
  }

  kind.subscribe((k) => {
    if( k == undefined ){
      kindValue = "";
    } else {
      kindValue = k;
    }
  })

  function doSearchPatient(): void {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者検索（スキャン）",
        onEnter: (p: Patient) => {
          patient.set(p);
        }
      }
    })
  }

  function onKindInputChange(): void {
    kind.set(kindValue);
  }

  function doSelectKind(): void {
    const d: ScanKindPulldown = new ScanKindPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: selectKindLink,
        onEnter: (k: string) => kind.set(k),
      }
    })
  }

  function doStartScan(): void {
    console.log($kind);
  }
</script>

<div class="top">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work">
    {#if $patient == undefined}
      {"（未選択）"}
    {:else}
      ({$patient.patientId}) {$patient.fullName()}
    {/if}
      <button on:click={doSearchPatient}>検索</button>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    <input type="text"  bind:value={kindValue} on:change={onKindInputChange}/>
    <a href="javascript:void(0)" on:click={doSelectKind} bind:this={selectKindLink}>選択</a>
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    {$scanner?.description ?? "（未選択）"}
    <a href="javascript:void(0)">選択</a>
  </div>
  <div class="commands"><button on:click={doStartScan}>スキャン開始</button></div>
  <div class="title">スキャン文書</div>
  <div class="commands">
    <button>アップロード</button><button>閉じる</button>
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
