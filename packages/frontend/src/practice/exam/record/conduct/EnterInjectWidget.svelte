<script lang="ts">
  import { ConductKind, ConductKindType, type ConductKindKey, type IyakuhinMaster, type VisitEx } from "@/lib/model";
  import Widget from "@/lib/Widget.svelte"
  import api from "@/lib/api"
  import SelectItem from "@/lib/SelectItem.svelte"
  import { type Writable, writable } from "svelte/store"
  import { showError } from "@/lib/showError-call"
  import { enter } from "../shinryou/helper"

  let widget: Widget;
  export let visit: VisitEx;
  let kind: ConductKindType = ConductKind.HikaChuusha;
  const kinds: ConductKindType[] = [
    ConductKind.HikaChuusha,
    ConductKind.JoumyakuChuusha,
    ConductKind.OtherChuusha,
  ]
  let searchTextInput: HTMLInputElement;
  let searchResult: IyakuhinMaster[] = [];
  let searchSelected: Writable<IyakuhinMaster | null> = writable(null);
  let amountInput: HTMLInputElement;

  export function open(): void {
    widget.open();
  }

  async function doSearch() {
    const t = searchTextInput.value.trim();
    if( t !== "" ){
      searchResult = await api.searchIyakuhinMaster(t, visit.visitedAt);
    }
  }

  const shinryouMap: Record<ConductKindKey, string[]> = {
    "HikaChuusha": ["皮下筋注"],
    "JoumyakuChuusha": ["静注"],
    "OtherChuusha": [],
    "Gazou": []
  };

  async function doEnter(close: () => void) {
    const master = $searchSelected;
    if( master == null ){
      showError("薬剤が選択されていません。");
      return;
    } else {
      const iyakuhincode = master.iyakuhincode;
      let amount: number;
      try {
        amount = parseFloat(amountInput.value);
      } catch(ex) {
        showError("用量の入力が数字でありません。");
        return;
      }
      await enter(visit, [], [
        {
          kind: kind,
          labelOption: kind.rep,
          shinryou: shinryouMap[kind.key],
          drug: [{ iyakuhincode, amount }],
          kizai: []
        }
      ]);
      close();
    }
  }

</script>

<Widget title="注射処置入力" let:close={close} bind:this={widget}>
  <div>薬剤名称：{$searchSelected?.name || ""}</div>
  <div>用量：<input type="text" value="1" bind:this={amountInput}/>{$searchSelected?.unit || ""}</div>
  <form>
    {#each kinds as k}
      <label>
        <input type="radio" value={k} bind:group={kind} name="kind" />
        {k.rep}
      </label>
    {/each}
  </form>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:this={searchTextInput}/> 
    <button type="submit">検索</button>
  </form>
  <div class="select">
    {#each searchResult as result (result.iyakuhincode)}
    <SelectItem selected={searchSelected} data={result}>
      {result.name}
    </SelectItem>
    {/each}
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>

<style>
  .select {
    height: 80px;
  }
</style>