<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { PatientData } from "../patient-dialog/patient-data";
  import * as kanjidate from "kanjidate";
  import type { Hoken } from "./hoken";
  import HokenInfoDialog from "./HokenInfoDialog.svelte";
  import EditPatientDialog from "./EditPatientDialog.svelte";
  import HokenHistoryDialog from "./HokenHistoryDialog.svelte";
  import ShahokokuhoDialog from "./edit/ShahokokuhoDialog.svelte";
  import KoukikoureiDialog from "./edit/KoukikoureiDialog.svelte";
  import KouhiDialog from "./edit/KouhiDialog.svelte";
  import {
    Shahokokuho,
    type Kouhi,
    Koukikourei,
    type Patient,
  } from "myclinic-model";
  import StartVisitDialog from "./StartVisitDialog.svelte";
  import api from "@/lib/api";
  import ImageViewerDialog from "./ImageViewerDialog.svelte";
  import DoubleEditHokenDialog from "./DoubleEditHokenDialog.svelte";
  // import { destroy_block } from "svelte/internal";

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
          patient: data.patient,
          destroy: () => d.$destroy(),
          onCancel: () => {
            data.goback();
          },
          onUpdate: (updated: Patient) => {
            data.patient = updated;
            data.goback();
          },
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
          title: "新規後期高齢",
          onEntered: (entered: Koukikourei) => {
            console.log("entered", entered);
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
    const d: StartVisitDialog = new StartVisitDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient: p,
        onCancel: () => {},
        onEnter: (_visit) => exit(),
      },
    });
  }

  async function doImage() {
    const files = await api.listPatientImage(p.patientId);
    const d: ImageViewerDialog = new ImageViewerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient: p,
        files,
      },
    });
  }

  function exit(): void {
    destroy();
    data.cleanup();
  }

  function listCurrentShahokokuho(): (Shahokokuho | Koukikourei)[] {
    const list: (Shahokokuho | Koukikourei)[] = [];
    currentList.forEach((c) => {
      const h = c.value;
      if (h instanceof Shahokokuho || h instanceof Koukikourei) {
        list.push(h);
      }
    });
    return list;
  }

  function countNonKouhiHoken(list: Hoken[]): number {
    let count: number = 0;
    list.forEach((h) => {
      if (h.isShahokokuho || h.isKoukikourei) {
        count += 1;
      }
    });
    return count;
  }

  function doDoubleEdit(): void {
    const ch = listCurrentShahokokuho();
    ch.sort((a, b) => a.validFrom.localeCompare(b.validFrom));
    if (ch.length === 2) {
      function open(): void {
        const d: DoubleEditHokenDialog = new DoubleEditHokenDialog({
          target: document.body,
          props: {
            destroy: () => {
              d.$destroy();
              data.goback();
            },
            hoken1: ch[0],
            hoken2: ch[1],
            patient: data.patient,
            onHandle: (s: Shahokokuho[], k: Koukikourei[]) => {
              s.forEach(h => data.hokenCache.enterOrUpdateHokenType(h));
              k.forEach(h => data.hokenCache.enterOrUpdateHokenType(h));
              d.$destroy();
              data.goback();
            },
            onDelete: (h: Shahokokuho | Koukikourei) => {
              data.hokenCache.remove(h);
              d.$destroy();
              data.goback();
            },
          },
        });
      }
      destroy();
      data.push(open);
    }
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
  <div class="current-list" data-cy="current-list">
    {#each currentList as h (h.key)}
      <a
        href="javascript:void(0)"
        on:click={() => doCurrentClick(h)}
        data-cy="current-hoken"
        data-hoken-key={h.key}>{h.rep}</a
      >
    {/each}
    {#if countNonKouhiHoken(currentList) > 1}
      <div class="overlap-notice">
        有効な保険証が重複しています。修正してください。
        {#if countNonKouhiHoken(currentList) === 2}
          <a href="javascript:;" on:click={doDoubleEdit}>修正編集</a>
        {/if}
      </div>
    {/if}
  </div>
  <div class="commands">
    <button on:click={doRegisterVisit}>診察受付</button>
    <button on:click={exit}>閉じる</button>
  </div>
  <div class="menu">
    <a href="javascript:void(0)" on:click={doEdit} data-cy="edit-patient-link"
      >編集</a
    >
    |
    <a
      href="javascript:void(0)"
      on:click={doNewShahokokuho}
      data-cy="new-shahokokuho-link">新規社保国保</a
    >
    |
    <a
      href="javascript:void(0)"
      on:click={doNewKoukikourei}
      data-cy="new-koukikourei-link">新規後期高齢</a
    >
    |
    <a href="javascript:void(0)" on:click={doNewKouhi} data-cy="new-kouhi-link"
      >新規公費</a
    >
    |
    <a
      href="javascript:void(0)"
      on:click={doHokenHistory}
      data-cy="hoken-history-link">保険履歴</a
    >
    |
    <a href="javascript:void(0)" on:click={doImage} data-cy="image-view"
      >保存画像</a
    >
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

  .overlap-notice {
    color: red;
  }
</style>
