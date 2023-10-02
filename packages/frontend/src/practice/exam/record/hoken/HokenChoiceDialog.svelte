<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { onshiConfirmHoken } from "@/lib/onshi-query-helper";
  import {
    type Visit,
    type Kouhi,
    type Koukikourei,
    Shahokokuho,
    Onshi,
    HokenIdSet,
  } from "myclinic-model";
  import { HokenItem, KouhiItem } from "./hoken-item";
  import type { OnshiResult } from "onshi-result";
  import OnshiDispDialog from "./OnshiDispDialog.svelte";
  import HokenMemoEditorDialog from "./HokenMemoEditorDialog.svelte";

  export let destroy: () => void;
  export let visit: Visit;
  export let shahokokuhoList: Shahokokuho[];
  export let koukikoureiList: Koukikourei[];
  export let kouhiList: Kouhi[];
  export let onshiResult: OnshiResult | undefined;
  export let visitDate: string;
  let hokenItems: HokenItem[] = [...shahokokuhoList, ...koukikoureiList].map(
    (h) => {
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
    }
  );
  let kouhiItems: KouhiItem[] = kouhiList.map((h) => {
    return new KouhiItem(h, visit.hasKouhiId(h.kouhiId));
  });
  let errors: string[] = [];

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
    console.log("visitId", visit.visitId);
    console.log(hokenItems);
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
    const [result, errs] = await onshiConfirmHoken(item.hoken, visitDate);
    if( errs.length> 0 ){
      errors = errs.map(e => e.toString());
    } else {
      item.confirm = result;
      hokenItems = [...hokenItems];
    }
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
      }
    })
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
  <div>
    {#each hokenItems as hokenItem (hokenItem.id)}
      <div class="item">
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
      </div>
    {/each}
    {#each kouhiItems as kouhiItem (kouhiItem.kouhi.kouhiId)}
      <div>
        <input
          type="checkbox"
          bind:checked={kouhiItem.checked}
        />{kouhiItem.rep()}
        <a href="javascript:void(0)" class="memo-link" on:click={() => doMemo(kouhiItem.kouhi)}>メモ</a>
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
</style>
