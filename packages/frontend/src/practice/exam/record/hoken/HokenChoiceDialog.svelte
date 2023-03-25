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
  import { Onshi, type Kouhi, type Koukikourei, type Roujin, type Shahokokuho } from "myclinic-model";
  import type { OnshiResult } from "onshi-result";
  import HokenKakuninDialog from "./HokenKakuninDialog.svelte";

  export let destroy: () => void;
  export let shahoOpt: [Shahokokuho, boolean] | null;
  export let roujinOpt: [Roujin, boolean] | null;
  export let koukiOpt: [Koukikourei, boolean] | null;
  export let kouhiList: [Kouhi, boolean][];
  export let onshiConfirmed: boolean | undefined;
  export let birthdate: string;
  export let visitDate: string;
  export let visitId: number;

  function doClose() {
    destroy();
  }

  function doEnter() {}

  async function doOnshiConfirm(hoken: Shahokokuho | Koukikourei) {
    const query = onshi_query_from_hoken(hoken, birthdate, visitDate);
    const d: HokenKakuninDialog = new HokenKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        query,
        onRegister: async (r: OnshiResult) => {
          await api.enterOnshi(new Onshi(visitId, JSON.stringify(r.origJson)));
          onshiConfirmed = true;
        }
      }
    })
  }
</script>

<Dialog title="保険選択1" destroy={doClose}>
  <div>
    {#if shahoOpt != null}
      {@const shaho = shahoOpt[0]}
      <div>
        <input type="checkbox" bind:checked={shahoOpt[1]} />
        {shahokokuhoRep(shaho)}
        {#if !onshiConfirmed}
          <a href="javascript:void(0)" on:click={() => doOnshiConfirm(shaho)}
            >資格確認</a
          >
        {/if}
      </div>
    {/if}
    {#if roujinOpt != null}
      <div>
        <input type="checkbox" bind:checked={roujinOpt[1]} />
        {roujinRep(roujinOpt[0].futanWari)}
      </div>
    {/if}
    {#if koukiOpt != null}
      {@const koukikourei = koukiOpt[0]}
      <div>
        <input type="checkbox" bind:checked={koukiOpt[1]} />
        {koukikoureiRep(koukiOpt[0].futanWari)}
        {#if !onshiConfirmed}
          <a
            href="javascript:void(0)"
            on:click={() => doOnshiConfirm(koukikourei)}>資格確認</a
          >
        {/if}
      </div>
    {/if}
    {#each kouhiList as kouhi}
      <div>
        <input type="checkbox" bind:checked={kouhi[1]} />{kouhiRep(
          kouhi[0].futansha
        )}
      </div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
</style>
