<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";
  import type { PatientData } from "../patient-dialog2/patient-data";
  import * as kanjidate from "kanjidate";
  import type { Hoken } from "./hoken";
  import HokenInfoDialog from "./HokenInfoDialog.svelte";
  import EditPatientDialog from "./EditPatientDialog.svelte";
  import EditHokenDialog from "./EditHokenDialog.svelte";

  export let data: PatientData;
  export let destroy: () => void;

  let p: Patient = data.getPatient();
  let currentList: Hoken[] = data.getCurrentList();

  function doCurrentClick(hoken: Hoken) {
    function open() {
      const d: HokenInfoDialog = new HokenInfoDialog({
        target: document.body,
        props: {
          hoken: data.getUpdate(hoken),
          data,
          destroy: () => d.$destroy(),
        },
      });
    }
    destroy();
    data.push(open);
  }

  function doEdit() {
    function open(): void {
      const d: EditPatientDialog = new EditPatientDialog({
        target: document.body,
        props: {
          data,
          destroy: () => d.$destroy()
        }
      })
    }
    destroy();
    data.push(open);
  }

  function doNew(slug: string): void {
    function open(): void {
      const d: EditHokenDialog = new EditHokenDialog({
        target: document.body,
        props: {
          data,
          hoken: slug,
          destroy: () => d.$destroy()
        }
      });
    }
    destroy();
    data.push(open);
  }

  function doNewShahokokuho() {
    doNew("shahokokuho");
  }

  function doNewKoukikourei() {
    doNew("koukikourei");
  }

  function doNewKouhi() {
    doNew("kouhi");
  }

  function doHokenHistory() {}

  function doPatientImages() {}
</script>

<SurfaceModal {destroy} title="患者情報" width="320px">
  <div class="info">
    <span>患者番号</span><span>{p.patientId}</span>
    <span>氏名</span><span>{p.lastName} {p.firstName}</span>
    <span>よみ</span><span>{p.lastNameYomi} {p.firstNameYomi}</span>
    <span>生年月日</span><span
      >{kanjidate.format(kanjidate.f2, p.birthday)}</span
    >
    <span>性別</span><span>{p.sexAsKanji}性</span>
    <span>住所</span><span>{p.address}</span>
    <span>電話番号</span><span>{p.phone}</span>
  </div>
  <div class="current-list">
    {#each currentList as h (h.key)}
      <a href="javascript:void(0)" on:click={() => doCurrentClick(h)}>{h.rep}</a
      >
    {/each}
  </div>
  <div class="commands">
    <button>診察受付</button>
    <button on:click={destroy}>閉じる</button>
  </div>
  <div class="menu">
    <a href="javascript:void(0)" on:click={doEdit}>編集</a>
    |
    <a href="javascript:void(0)" on:click={doNewShahokokuho}>新規社保国保</a>
    |
    <a href="javascript:void(0)" on:click={doNewKoukikourei}>新規後期高齢</a>
    |
    <a href="javascript:void(0)" on:click={doNewKouhi}>新規公費</a> |
    <a href="javascript:void(0)" on:click={doHokenHistory}>保険履歴</a> |
    <a href="javascript:void(0)" on:click={doPatientImages}>保存画像</a>
  </div>
</SurfaceModal>

<style>
  .info {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .info *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }

  .current-list {
    margin: 10px 0 0 0;
  }

  .current-list a + a {
    margin-left: 6px;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin: 0;
    margin-bottom: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .menu a {
    word-break: keep-all;
  }
</style>
