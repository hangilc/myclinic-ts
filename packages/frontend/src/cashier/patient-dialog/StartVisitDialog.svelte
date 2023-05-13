<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    HokenIdSet,
    Kouhi,
    Koukikourei,
    Shahokokuho,
    Visit,
    type Patient,
  } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import { kouhiRep, koukikoureiRep, shahokokuhoRep } from "@/lib/hoken-rep";
  import { onshiConfirmHoken } from "@/lib/onshi-query-helper";
  import { dateToSql } from "@/lib/util";
  import { onshiConfirm } from "@/lib/onshi-confirm";
  import { Onshi } from "myclinic-model/model";
  import { confirm } from "@/lib/confirm-call";
  import type { Hoken, HokenType } from "./hoken";
  import { KoukikoureiItem, ShahokokuhoItem } from "./start-visit-dialog";
  import { hotlineTrigger } from "@/reception/reception-vars";

  export let destroy: () => void;
  export let patient: Patient;
  export let hokenList: Hoken[];
  export let onEnter: (visit: Visit) => void;
  export let onCancel: () => void;
  export let at = new Date();
  export let inProgressNotice: string = "";
  export let error: string = "";
  let shahokokuhoList: ShahokokuhoItem[] = [];
  let koukikoureiList: KoukikoureiItem[] = [];
  let kouhiList: Kouhi[] = [];
  let hokenSelectionCount: number = 0;
  let hokenConfirmedCount: number = 0;

  setupList();
  updateHokenSelectionCount();
  updateHokenConfirmedCount();

  function setupList() {
    let checked = true;
    hokenList.forEach((e) => {
      const h: HokenType = e.value;
      if (h instanceof Shahokokuho) {
        shahokokuhoList.push(new ShahokokuhoItem(h, checked));
        if (checked) {
          checked = false;
        }
      } else if (h instanceof Koukikourei) {
        koukikoureiList.push(new KoukikoureiItem(h, checked));
        if (checked) {
          checked = false;
        }
      } else if (h instanceof Kouhi) {
        kouhiList.push(h);
      }
    });
  }

  function updateHokenSelectionCount(): void {
    let c = 0;
    shahokokuhoList.forEach((item) => {
      if (item.checked) {
        c += 1;
      }
    });
    koukikoureiList.forEach((item) => {
      if (item.checked) {
        c += 1;
      }
    });
    hokenSelectionCount = c;
  }

  function updateHokenConfirmedCount(): void {
    let c = 0;
    shahokokuhoList.forEach((item) => {
      if (item.checked && item.confirmed) {
        c += 1;
      }
    });
    koukikoureiList.forEach((item) => {
      if (item.checked && item.confirmed) {
        c += 1;
      }
    });
    hokenConfirmedCount = c;
  }

  function doShahokokuhoChange(item: ShahokokuhoItem): void {
    updateHokenSelectionCount();
    updateHokenConfirmedCount();
    error = "";
  }

  function doKoukikoureiChange(item: KoukikoureiItem): void {
    updateHokenSelectionCount();
    updateHokenConfirmedCount();
    error = "";
  }

  function createHokenIdSet(): HokenIdSet {
    let shahokokuhoId = 0;
    let koukikoureiId = 0;
    shahokokuhoList.forEach((item) => {
      if (item.checked) {
        shahokokuhoId = item.shahokokuho.shahokokuhoId;
      }
    });
    koukikoureiList.forEach((item) => {
      if (item.checked) {
        koukikoureiId = item.koukikourei.koukikoureiId;
      }
    });
    return new HokenIdSet(
      shahokokuhoId,
      koukikoureiId,
      0,
      kouhiList.length > 0 ? kouhiList[0].kouhiId : 0,
      kouhiList.length > 1 ? kouhiList[1].kouhiId : 0,
      kouhiList.length > 2 ? kouhiList[2].kouhiId : 0
    );
  }

  function getSelectedHoken(): ShahokokuhoItem | KoukikoureiItem | undefined {
    for (let h of [...shahokokuhoList, ...koukikoureiList]) {
      if (h.checked) {
        return h;
      }
    }
    return undefined;
  }

  async function doEnter(need_onshi_confirm: boolean) {
    const hokenIdSet = createHokenIdSet();
    if (hokenIdSet.shahokokuhoId > 0 && hokenIdSet.koukikoureiId > 0) {
      error =
        "複数の保険（社保国保と後期高齢）が設定されていますので、入力できません。";
      return;
    }
    const item = getSelectedHoken();
    if (item && need_onshi_confirm && !item.confirmed) {
      if (item instanceof ShahokokuhoItem) {
        error = "社保国保の資格確認ができていません。";
      } else {
        error = "後期高齢の資格確認ができていません。";
      }
      return;
    }
    let visit: Visit | undefined = undefined;
    try {
      visit = await api.startVisitWithHoken(patient.patientId, at, hokenIdSet);
      hotlineTrigger?.emit(`[Bot] ${patient.fullName("")}様の診察を受け付けました。`);
    } catch (e) {
      error = "診察の登録に失敗しました。";
      return;
    }
    if (item && item.confirmed) {
      try {
        await api.setOnshi(
          new Onshi(visit.visitId, JSON.stringify(item.confirmed.toJSON()))
        );
      } catch (e) {
        error = "資格確認情報の登録に失敗しました。";
      }
    }
    destroy();
    onEnter(visit);
  }

  function doCancel() {
    destroy();
    onCancel();
  }

  async function doOnshiKakunin() {
    const checked = [...shahokokuhoList, ...koukikoureiList].filter(
      (h) => h.checked
    );
    if (checked.length === 1) {
      const item = checked[0];
      inProgressNotice = "オンライン資格確認中";
      const [result, e] = await onshiConfirmHoken(item.value, dateToSql(at));
      if( e.length === 0 ){
        item.confirmed = result;
          updateHokenConfirmedCount();
          shahokokuhoList = [...shahokokuhoList];
          koukikoureiList = [...koukikoureiList];
      } else {
        error = e.map(e => e.toString()).join("");
      }
      inProgressNotice = "";

      // const q = onshi_query_from_hoken(
      //   item.value,
      //   patient.birthday,
      //   dateToSql(at)
      // );
      // try {
      //   const result = await onshiConfirm(q);
      //   if (result.isValid) {
      //     item.confirmed = result;
      //     updateHokenConfirmedCount();
      //     shahokokuhoList = [...shahokokuhoList];
      //     koukikoureiList = [...koukikoureiList];
      //   } else {
      //     error = result.getErrorMessage();
      //   }
      // } catch (ex: any) {
      //   error = "資格確認サーバーエラー：" + ex.toString();
      // } finally {
      //   inProgressNotice = "";
      // }
    }
  }

  function doEnterWithoutOnshiKakunin() {
    confirm("資格確認なしで入力していいですか？", () => doEnter(false));
  }

  function formatBirthday(birthday: string): string {
    const d = new Date(birthday);
    const age = kanjidate.calcAge(d);
    return `${kanjidate.format(kanjidate.f2, d)}（${age}才）`;
  }
</script>

<Dialog destroy={doCancel} title="診察受付" styleWidth="300px">
  <div class="patient-panel">
    <span>患者番号</span><span>{patient.patientId}</span>
    <span>氏名</span><span>{patient.fullName()}</span>
    <span>生年月日</span><span>{formatBirthday(patient.birthday)}</span>
    <span>性別</span><span>{patient.sexAsKanji}性</span>
    <span>保険</span>
    <div class="hoken-area">
      {#each shahokokuhoList as item (item.shahokokuho.shahokokuhoId)}
        <div>
          <label>
            <input
              type="checkbox"
              data-cy="hoken-input"
              bind:checked={item.checked}
              data-shahokokuho-id={item.shahokokuho.shahokokuhoId}
              on:change={() => doShahokokuhoChange(item)}
            />
            <span data-cy="hoken-label">{shahokokuhoRep(item.shahokokuho)}</span
            >
          </label>
          {#if item.confirmed}
            <span class="onshi-confirmed-notice" data-cy="onshi-confirmed"
              >資格確認済</span
            >
          {/if}
        </div>
      {/each}
      {#each koukikoureiList as item (item.koukikourei.koukikoureiId)}
        <div>
          <label>
            <input
              type="checkbox"
              data-cy="hoken-input"
              bind:checked={item.checked}
              data-koukikourei-id={item.koukikourei.koukikoureiId}
              on:change={() => doKoukikoureiChange(item)}
            />
            <span data-cy="hoken-label"
              >{koukikoureiRep(item.koukikourei.futanWari)}</span
            >
          </label>
          {#if item.confirmed}
            <span class="onshi-confirmed-notice" data-cy="onshi-confirmed"
              >資格確認済</span
            >
          {/if}
        </div>
      {/each}
      {#each kouhiList as kouhi (kouhi.kouhiId)}
        <div data-kouhi-id={kouhi.kouhiId}>{kouhiRep(kouhi.futansha)}</div>
        <!-- <div>
          <label>
            <input type="checkbox" checked data-cy="kouhi-input" data-kouhi-id={kouhi.kouhiId}/>
            <span data-cy="kouhi-label">{kouhiRep(kouhi.futansha)}</span>
          </label>
        </div> -->
      {/each}
    </div>
  </div>
  {#if inProgressNotice}
    <div class="in-progress-notice">{inProgressNotice}</div>
  {/if}
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if hokenSelectionCount > 1}
    <div class="error">保険が複数選択されています。</div>
  {/if}
  <div class="commands">
    {#if hokenSelectionCount <= 1}
      {#if hokenConfirmedCount < hokenSelectionCount}
        <a
          href="javascript:;"
          class="skip-onshi-confirm-link"
          on:click={doEnterWithoutOnshiKakunin}>資格確認なしで入力</a
        >
        <button on:click={doOnshiKakunin}>資格確認</button>
      {:else}
        <button on:click={() => doEnter(true)}>入力</button>
      {/if}
    {/if}
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .patient-panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .patient-panel > *:nth-child(odd) {
    text-align: right;
  }

  .patient-panel > *:nth-child(even) {
    margin-left: 10px;
  }

  .hoken-area {
    display: inline-block;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
    align-items: center;
  }

  .commands * + button {
    margin-left: 4px;
  }

  .in-progress-notice {
    color: green;
    text-align: center;
    margin: 10px 0;
  }

  .error {
    color: red;
    border: 1px solid red;
    margin: 10px 0;
    padding: 10px;
  }

  .onshi-confirmed-notice {
    color: green;
    font-weight: bold;
  }

  .skip-onshi-confirm-link {
    font-size: 12px;
    margin-right: 6px;
  }
</style>
