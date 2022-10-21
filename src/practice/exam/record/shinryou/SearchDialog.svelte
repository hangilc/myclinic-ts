<script lang="ts">
    import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte"
  import type { VisitEx } from "@/lib/model";

  export let visit: VisitEx
  let dialog: Dialog;
  let searchTextInput: HTMLInputElement;

  export function open(): void {
    dialog.open();
  }

  async function doSearch() {
    const text = searchTextInput.value.trim();
    if( text !== "" ){
      const result = await api.searchShinryouMaster(text, visit.visitedAt);
      console.log(result);
    }
  }
</script>

<Dialog bind:this={dialog} let:close={close}>
  <span slot="title">診療行為検索入力</span>
  <div>
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:this={searchTextInput} />
      <button type="submit">検索</button>
    </form>
  </div>
  <svelte:fragment slot="commands">
    <button>入力</button>
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Dialog>