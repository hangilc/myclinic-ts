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
    type Onshi,
  } from "myclinic-model";
  import HokenKakuninDialog from "./HokenKakuninDialog.svelte";
  import { HokenItem, KouhiItem } from "./hoken-item";
  import type {
    KoukikoureiItem,
    ShahokokuhoItem,
  } from "@/cashier/patient-dialog/start-visit-dialog";
  import type { OnshiResult } from "onshi-result";
  import OnshiDisp from "./OnshiDispDialog.svelte";

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
  let kouhiItems: KouhiItem[] = kouhiList.map((h) => new KouhiItem(h));

  function doClose() {
    destroy();
  }

  async function doEnter() {
    //   const shahokokuhoId = shahoOpt && shahoOpt[1] ? shahoOpt[0].shahokokuhoId : 0;
    //   const roujinId = roujinOpt && roujinOpt[1] ? roujinOpt[0].roujinId : 0;
    //   const koukikoureiId = koukiOpt && koukiOpt[1] ? koukiOpt[0].koukikoureiId : 0;
    //   const kouhiIds = kouhiList.filter(kouhi => kouhi[1]).map(kouhi => kouhi[0].kouhiId);
    //   const kouhi1Id = kouhiIds.length > 0 ? kouhiIds[0] : 0;
    //   const kouhi2Id = kouhiIds.length > 1 ? kouhiIds[1] : 0;
    //   const kouhi3Id = kouhiIds.length > 2 ? kouhiIds[2] : 0;
    //   const hokenCount = (shahokokuhoId > 0 ? 1 : 0) + (roujinId > 0 ? 1 : 0) +
    //   (koukikoureiId > 0 ? 1 : 0);
    //   if( hokenCount > 1 ){
    //     alert("Multiple primary hoken selected.");
    //     return;
    //   } else if( hokenCount === 0 ){
    //     await api.clearOnshi(visitId);
    //     onshiConfirmed = false;
    //   }
    //   await api.updateHokenIds(visitId, new HokenIdSet(
    //     shahokokuhoId, koukikoureiId, roujinId, kouhi1Id, kouhi2Id, kouhi3Id
    //   ));
    //   doClose();
  }

  async function doOnshiConfirm(item: HokenItem) {
    const query = onshi_query_from_hoken(item.hoken, birthdate, visitDate);
    const d: HokenKakuninDialog = new HokenKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        query,
        visitId: visit.visitId,
        onRegister: (r) => {
          item.confirm = r;
          hokenItems = [...hokenItems];
        },
      },
    });
  }

  function doShowConfirmed(result: OnshiResult | undefined): void {
    if( !result ){
      return;
    }
    const d: OnshiDisp = new OnshiDisp({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        result,
      }
    })
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
          <a href="javascript:void(0)" class="has-been-confirmed-link"
            on:click={() => doShowConfirmed(hokenItem.confirm)}
          >確認済</a>
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
    <button on:click={doEnter}>入力</button>
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
