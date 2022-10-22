<script lang="ts">
  import { ConductKind, ConductKindType, type VisitEx } from "@/lib/model";
  import Widget from "@/lib/Widget.svelte"
  import api from "@/lib/api"

  let widget: Widget;
  export let visit: VisitEx;
  let kind: ConductKindType = ConductKind.HikaChuusha;
  const kinds: ConductKindType[] = [
    ConductKind.HikaChuusha,
    ConductKind.JoumyakuChuusha,
    ConductKind.OtherChuusha,
  ]
  let searchTextInput: HTMLInputElement;

  export function open(): void {
    widget.open();
  }

  async function doSearch() {
    const t = searchTextInput.value.trim();
    if( t !== "" ){
      const result = await api.searchIyakuhinMaster(t, visit.visitedAt);
      console.log(result);
    }
  }

  async function doEnter() {
    console.log(kind);
  }

</script>

<Widget title="注射処置入力" let:close={close} bind:this={widget}>
  <div>薬剤名称：</div>
  <div>用量：<input type="text" /></div>
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

  </div>
  <svelte:fragment slot="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>

<style>
  .select {
    height: 80px;
  }
</style>