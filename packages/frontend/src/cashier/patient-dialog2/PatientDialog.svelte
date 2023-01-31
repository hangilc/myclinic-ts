<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type {
    Kouhi,
    Koukikourei,
    Patient,
    Shahokokuho,
  } from "myclinic-model";
  import type { PatientData } from "../patient-dialog2/patient-data";
  import * as kanjidate from "kanjidate";
  import type { Hoken } from "./hoken";
  import HokenInfoDialog from "./HokenInfoDialog.svelte";
  import EditPatientDialog from "./EditPatientDialog.svelte";
  import EditHokenDialog from "./EditHokenDialog.svelte";
  import HokenHistoryDialog from "./HokenHistoryDialog.svelte";
  import api from "@/lib/api";
  import ShahokokuhoDialog from "./edit/ShahokokuhoDialog.svelte";
  import KoukikoureiDialog from "./edit/KoukikoureiDialog.svelte";
  import KouhiDialog from "./edit/KouhiDialog.svelte";

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
          destroy: () => d.$destroy(),
        },
      });
    }
    destroy();
    data.push(open);
  }

  function doNewShahokokuho() {
    function open(): void {
      const d: ShahokokuhoDialog = new ShahokokuhoDialog({
        target: document.body,
        props: {
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          patient: p,
          init: null,
          title: "新規社保国保",
          onEntered: (entered: Shahokokuho) => {
            data.hokenCache.enterHokenType(entered);
          },
        },
      });
    }
    destroy();
    data.push(open);
  }

  function doNewKoukikourei() {
    function open(): void {
      const d: KoukikoureiDialog = new KoukikoureiDialog({
        target: document.body,
        props: {
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          patient: p,
          init: null,
          title: "新規後期高齢保険",
          onEntered: (entered: Koukikourei) => {
            data.hokenCache.enterHokenType(entered);
          },
        },
      });
    }
    destroy();
    data.push(open);
  }

  function doNewKouhi() {
    function open(): void {
      const d: KouhiDialog = new KouhiDialog({
        target: document.body,
        props: {
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          patient: p,
          init: null,
          title: "新規公費",
          onEntered: (entered: Kouhi) => {
            data.hokenCache.enterHokenType(entered);
          },
        },
      });
    }
    destroy();
    data.push(open);
  }

  async function doHokenHistory() {
    await data.fetchAllHoken();
    function open(): void {
      const d: HokenHistoryDialog = new HokenHistoryDialog({
        target: document.body,
        props: {
          data,
          destroy: () => d.$destroy(),
        },
      });
    }
    destroy();
    data.push(open);
  }

  async function doRegisterVisit() {
    await api.startVisit(p.patientId, new Date());
    exit();
  }

  function exit(): void {
    destroy();
    data.cleanup();
  }
</script>

<SurfaceModal destroy={exit} title="患者情報" width="320px">
  <div class="info">
    <span>患者番号</span><span data-cy="patient-id">{p.patientId}</span>
    <span>氏名</span>
    <div class="composite-value">
      <span data-cy="last-name">{p.lastName}</span>
      <span data-cy="first-name">{p.firstName}</span>
    </div>
    <span>よみ</span>
    <div class="composite-value">
      <span data-cy="last-name-yomi">{p.lastNameYomi}</span>
      <span data-cy="first-name-yomi">{p.firstNameYomi}</span>
    </div>
    <span>生年月日</span><span data-cy="birthday"
      >{kanjidate.format(kanjidate.f2, p.birthday)}</span
    >
    <span>性別</span><span data-cy="sex">{p.sexAsKanji}性</span>
    <span>住所</span><span data-cy="address">{p.address}</span>
    <span>電話番号</span><span data-cy="phone">{p.phone}</span>
  </div>
  <div class="current-list">
    {#each currentList as h (h.key)}
      <a href="javascript:void(0)" on:click={() => doCurrentClick(h)}>{h.rep}</a
      >
    {/each}
  </div>
  <div class="commands">
    <button on:click={doRegisterVisit}>診察受付</button>
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
    <a href="javascript:void(0)" on:click={doHokenHistory}>保険履歴</a>
  </div>
</SurfaceModal>

<style>
  .info {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .info > *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }

  .composite-value {
    display: inline-block;
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
