<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    kouhiRep,
    koukikoureiRep,
    roujinRep,
    shahokokuhoRep,
  } from "@/lib/hoken-rep";
  import { onshi_query_from_hoken } from "@/lib/onshi-query-helper";
  import {
    type Visit,
    type Kouhi,
    type Koukikourei,
    Shahokokuho,
    Onshi,
    HokenIdSet,
  } from "myclinic-model";
  import HokenKakuninDialog from "./HokenKakuninDialog.svelte";
  import { HokenItem, KouhiItem } from "./hoken-item";
  import type {
    KoukikoureiItem,
    ShahokokuhoItem,
  } from "@/cashier/patient-dialog/start-visit-dialog";
  import type { OnshiResult } from "onshi-result";
  import OnshiDisp from "./OnshiDispDialog.svelte";
  import { onshiConfirm, onshiLogin } from "@/lib/onshi-confirm";

  export let destroy: () => void;
  export let visit: Visit;
  export let shahokokuhoList: Shahokokuho[];
  export let koukikoureiList: Koukikourei[];
  export let kouhiList: Kouhi[];
  export let onshiResult: OnshiResult | undefined;
  export let birthdate: string;
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
    const query = onshi_query_from_hoken(item.hoken, birthdate, visitDate);
    const login = await onshiLogin();
    query.idToken = login.result.idToken;
    const onshiResult = await onshiConfirm(query);
    console.log(onshiResult);
  }

  async function doOnshiConfirmOrig(item: HokenItem) {
    const query = onshi_query_from_hoken(item.hoken, birthdate, visitDate);
    const d: HokenKakuninDialog = new HokenKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        query,
        onRegister: (r) => {
          item.confirm = r;
          hokenItems = [...hokenItems];
        },
      },
    });
  }

  function doShowConfirmed(result: OnshiResult | undefined): void {
    if (!result) {
      return;
    }
    const d: OnshiDisp = new OnshiDisp({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        result,
      },
    });
  }
</script>

<Dialog title="保険選択" destroy={doClose}>
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

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
  }

  .commands button + button {
    margin-left: 4px;
  }
</style>
