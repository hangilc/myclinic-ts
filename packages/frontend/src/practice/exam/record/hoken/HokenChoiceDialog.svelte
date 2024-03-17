<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    messageOfOnshiConfirmHokenResult,
    onshiConfirmHoken,
  } from "@/lib/onshi-query-helper";
  import {
    type Visit,
    type Kouhi,
    Koukikourei,
    Shahokokuho,
    Onshi,
    HokenIdSet,
  } from "myclinic-model";
  import { HokenItem, KouhiItem } from "./hoken-item";
  import type { OnshiResult } from "onshi-result";
  import OnshiDispDialog from "./OnshiDispDialog.svelte";
  import HokenMemoEditorDialog from "./HokenMemoEditorDialog.svelte";
  import ShahokokuhoDetail from "./ShahokokuhoDetail.svelte";
  import KoukikoureiDetail from "./KoukikoureiDetail.svelte";
  import KouhiDetail from "./KouhiDetail.svelte";
  import {
    createHokenFromOnshiResult,
    tryFixKoukikoureiValidUpto,
    tryFixShahokokuhoValidUpto,
  } from "@/lib/onshi-hoken";
  import { koukikoureiDeleted, koukikoureiUpdated, shahokokuhoDeleted, shahokokuhoUpdated, visitUpdated } from "@/app-events";
  import { onDestroy } from "svelte";

  export let destroy: () => void;
  export let visit: Visit;
  export let shahokokuhoList: Shahokokuho[];
  export let koukikoureiList: Koukikourei[];
  export let kouhiList: Kouhi[];
  export let onshiResult: OnshiResult | undefined;
  export let visitDate: string;
  let hokenItems: HokenItem[] = makeHokenItems();
  let kouhiItems: KouhiItem[] = makeKouhiItems();
  let errors: string[] = [];
  let fEnterHokenFromOnshi: (() => void) | undefined = undefined;
  const unsubs = [
    visitUpdated.subscribe(async (updated) => {
      if (updated && updated.visitId === visit.visitId) {
        visit = updated;
        await updateHokenData();
      }
    }),
    shahokokuhoUpdated.subscribe(async (updated) => {
      if( updated && updated.patientId === visit.patientId ){
       await updateHokenData();
      }
    }),
    shahokokuhoDeleted.subscribe(async (updated) => {
      if( updated && updated.patientId === visit.patientId ){
       await updateHokenData();
      }
    }),
    koukikoureiUpdated.subscribe(async (updated) => {
      if( updated && updated.patientId === visit.patientId ){
       await updateHokenData();
      }
    }),
    koukikoureiDeleted.subscribe(async (updated) => {
      if( updated && updated.patientId === visit.patientId ){
       await updateHokenData();
      }
    }),
  ];

  onDestroy(() => unsubs.forEach((f) => f()));

  async function updateHokenData() {
    const patientId = visit.patientId;
        const at = visit.visitedAt.substring(0, 10);
        shahokokuhoList = await api.listAvailableShahokokuho(patientId, at);
        koukikoureiList = await api.listAvailableKoukikourei(patientId, at);
        kouhiList = await api.listAvailableKouhi(patientId, at);
        onshiResult = undefined;
        hokenItems = makeHokenItems();
        kouhiItems = makeKouhiItems();
        errors = [];
        fEnterHokenFromOnshi = undefined;
  }

  function makeHokenItems() {
    return [...shahokokuhoList, ...koukikoureiList].map((h) => {
      const item = new HokenItem(h);
      if (h instanceof Shahokokuho) {
        if (visit.shahokokuhoId === h.shahokokuhoId) {
          item.checked = true;
          item.confirm = onshiResult;
          item.savedConfirm = onshiResult;
        }
      } else {
        if (visit.koukikoureiId === h.koukikoureiId) {
          item.checked = true;
        }
      }
      return item;
    });
  }

  function makeKouhiItems() {
    return kouhiList.map((h) => {
      return new KouhiItem(h, visit.hasKouhiId(h.kouhiId));
    });
  }

  function countSelectedHoken(hokenItems: HokenItem[]): number {
    return hokenItems.filter((item) => item.checked).length;
  }

  function doClose() {
    destroy();
  }

  function createHokenIdSet(): HokenIdSet {
    let shahokokuhoId = 0;
    let koukikoureiId = 0;
    hokenItems.forEach((item) => {
      if (item.checked) {
        const hoken = item.hoken;
        if (hoken instanceof Shahokokuho) {
          shahokokuhoId = hoken.shahokokuhoId;
        } else {
          koukikoureiId = hoken.koukikoureiId;
        }
      }
    });
    const selectedKouhiList: Kouhi[] = kouhiItems
      .filter((item) => item.checked)
      .map((item) => item.kouhi);
    return new HokenIdSet(
      shahokokuhoId,
      koukikoureiId,
      0,
      selectedKouhiList.length > 0 ? selectedKouhiList[0].kouhiId : 0,
      selectedKouhiList.length > 1 ? selectedKouhiList[1].kouhiId : 0,
      selectedKouhiList.length > 2 ? selectedKouhiList[2].kouhiId : 0
    );
  }

  async function doEnter() {
    if (
      hokenItems.filter((item) => item.savedConfirm && !item.checked).length > 0
    ) {
      await api.clearOnshi(visit.visitId);
    }
    const selectedHokenList = hokenItems.filter((item) => item.checked);
    if (selectedHokenList.length > 1) {
      return;
    }
    const hokenIdSet = createHokenIdSet();
    await api.updateHokenIds(visit.visitId, hokenIdSet);
    await Promise.all(
      hokenItems
        .filter((item) => item.checked && item.confirm && !item.savedConfirm)
        .map(
          async (item) =>
            await api.setOnshi(
              new Onshi(visit.visitId, JSON.stringify(item.confirm!.toJSON()))
            )
        )
    );
    doClose();
  }

  async function doOnshiConfirm(item: HokenItem) {
    const result = await onshiConfirmHoken(item.hoken, visitDate);
    fEnterHokenFromOnshi = undefined;
    if (result.ok) {
      item.confirm = result.result;
      hokenItems = [...hokenItems];
    } else {
      errors = [messageOfOnshiConfirmHokenResult(result)];
      if (result.error === "inconsistent") {
        fEnterHokenFromOnshi = doEnterHokenFromOnshi(result.result, item.hoken);
      }
    }
  }

  function doEnterHokenFromOnshi(
    result: OnshiResult,
    current: Shahokokuho | Koukikourei
  ): () => void {
    return async () => {
      fEnterHokenFromOnshi = undefined;
      errors = [];
      const hoken = createHokenFromOnshiResult(
        visit.patientId,
        result.resultList[0]
      );
      if (typeof hoken === "string") {
        fEnterHokenFromOnshi = undefined;
        errors = [hoken];
      } else {
        const startDate = visit.visitedAt.substring(0, 10);
        hoken.validFrom = startDate;
        hoken.validUpto = "0000-00-00";
        let enteredShahokokuho: Shahokokuho | undefined = undefined;
        let enteredKoukikourei: Koukikourei | undefined = undefined;
        let prevShahokokuho = await api.listAvailableShahokokuho(
          visit.patientId,
          startDate
        );
        for(let prev of prevShahokokuho){
          console.log("prev", prev);
        }
        let prevKoukikourei = await api.listAvailableKoukikourei(
          visit.patientId,
          startDate
        );
        if (hoken instanceof Shahokokuho) {
          enteredShahokokuho = await api.enterShahokokuho(hoken);
        } else if (hoken instanceof Koukikourei) {
          enteredKoukikourei = await api.enterKoukikourei(hoken);
        }
        const hokenIdSet: HokenIdSet = new HokenIdSet(
          0,
          0,
          0,
          visit.kouhi1Id,
          visit.kouhi2Id,
          visit.kouhi3Id
        );
        if (enteredShahokokuho) {
          hokenIdSet.shahokokuhoId = enteredShahokokuho.shahokokuhoId;
        }
        if (enteredKoukikourei) {
          hokenIdSet.koukikoureiId = enteredKoukikourei.koukikoureiId;
        }
        await api.updateHokenIds(visit.visitId, hokenIdSet);
        for (let prev of prevShahokokuho) {
          const err = await tryFixShahokokuhoValidUpto(prev, startDate);
          if (err) {
            errors.push(err);
          }
        }
        for (let prev of prevKoukikourei) {
          const err = await tryFixKoukikoureiValidUpto(prev, startDate);
          if (err) {
            errors.push(err);
          }
        }
      }
    };
  }

  function doShowConfirmed(result: OnshiResult | undefined): void {
    if (!result) {
      return;
    }
    const d: OnshiDispDialog = new OnshiDispDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        result,
      },
    });
  }

  function doMemo(kouhi: Kouhi): void {
    const d: HokenMemoEditorDialog = new HokenMemoEditorDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        memo: kouhi.memo,
        onEnter: (newMemo: string | undefined) => {
          const newKouhi = Object.assign({}, kouhi, { memo: newMemo });
          api.updateKouhi(newKouhi);
        },
      },
    });
  }
</script>

<Dialog title="保険選択" destroy={doClose} styleWidth="260px">
  {#if errors.length > 0}
    <div class="error">
      {#each errors as error}
        <div>{error}</div>
      {/each}
    </div>
  {/if}
  {#if fEnterHokenFromOnshi}
    <div class="show-enter-hoken-button-wrapper">
      <button
        on:click={() => (fEnterHokenFromOnshi ? fEnterHokenFromOnshi() : {})}
        >新規保険入力</button
      >
    </div>
  {/if}
  <div>
    {#each hokenItems as hokenItem (hokenItem.id)}
      <div class="item" data-type="hoken-item" data-hoken-type={hokenItem.hokenType()} 
        data-hoken-id={hokenItem.id}}>
        <div>
          <input type="checkbox" bind:checked={hokenItem.checked} />
          <span>{hokenItem.rep()}</span>
          {#if !hokenItem.confirm}
            <a
              href="javascript:void(0)"
              class="confirm-link"
              on:click={() => doOnshiConfirm(hokenItem)}>資格確認</a
            >
          {:else}
            <a
              href="javascript:void(0)"
              class="has-been-confirmed-link"
              on:click={() => doShowConfirmed(hokenItem.confirm)}>確認済</a
            >
          {/if}
          <a
            href="javascript:void(0)"
            on:click={() => (hokenItem.showDetail = !hokenItem.showDetail)}
            >詳細</a
          >
        </div>
        {#if hokenItem.showDetail}
          <div class="detail">
            {#if hokenItem.hoken instanceof Shahokokuho}
              <ShahokokuhoDetail shahokokuho={hokenItem.hoken} />
            {:else if hokenItem.hoken instanceof Koukikourei}
              <KoukikoureiDetail koukikourei={hokenItem.hoken} />
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    {#each kouhiItems as kouhiItem (kouhiItem.kouhi.kouhiId)}
      <div>
        <input
          type="checkbox"
          bind:checked={kouhiItem.checked}
        />{kouhiItem.rep()}
        <a
          href="javascript:void(0)"
          class="memo-link"
          on:click={() => doMemo(kouhiItem.kouhi)}>メモ</a
        >
        <a
          href="javascript:void(0)"
          on:click={() => (kouhiItem.showDetail = !kouhiItem.showDetail)}
          >詳細</a
        >
        {#if kouhiItem.showDetail}
          <div class="detail"><KouhiDetail kouhi={kouhiItem.kouhi} /></div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="commands">
    {#if countSelectedHoken(hokenItems) <= 1}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .item {
    margin: 2px 0;
  }

  a.confirm-link {
    border: 1px solid var(--primary-color);
    vertical-align: middle;
    padding: 2px;
    font-size: 80%;
    border-radius: 3px;
  }

  a.has-been-confirmed-link {
    font-size: 80%;
    color: orange;
    vertical-align: middle;
  }

  a.memo-link {
    border: 1px solid orange;
    vertical-align: middle;
    padding: 2px;
    font-size: 80%;
    border-radius: 3px;
    color: orange;
  }

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
  }

  .commands button + button {
    margin-left: 4px;
  }

  .error {
    margin-bottom: 10px;
    color: red;
  }

  .detail {
    margin: 4px 10px;
    padding: 10px;
    border: 1px solid gray;
  }

  .show-enter-hoken-button-wrapper {
    margin: 4px 10px 10px 10px;
  }
</style>
