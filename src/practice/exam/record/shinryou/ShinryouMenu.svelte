<script lang="ts">
  import Pulldown from "@/lib/Pulldown.svelte"
  import api from "@/lib/api"
  import type { VisitEx } from "@/lib/model"
  import RegularDialog from "./RegularDialog.svelte"
  import KensaDialog from "./KensaDialog.svelte"
  import SearchDialog from "./SearchDialog.svelte"

  export let visit: VisitEx;
  let auxLink: HTMLAnchorElement;
  let auxPopup: Pulldown;
  let regularDialog: RegularDialog;
  let kensaDialog: KensaDialog;
  let searchDialog: SearchDialog;


  function doAux(): void {
    auxPopup.open();
  }
  
  async function doRegular() {
    const names = await api.getShinryouRegular();
    regularDialog.open(names);
  }

  async function doKensa() {
    const kensa = await api.getShinryouKensa();
    kensaDialog.open(kensa);
  }

  function doSearch(): void {
    searchDialog.open();
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <a href="javascript:void(0)"  on:click={doRegular}>[診療行為]</a>
  <a href="javascript:void(0)" bind:this={auxLink} on:click={doAux}>その他</a>
</div>

<RegularDialog bind:this={regularDialog} visit={visit}/>
<KensaDialog bind:this={kensaDialog} visit={visit} />
<SearchDialog bind:this={searchDialog} visit={visit}/>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={auxLink} bind:this={auxPopup}>
  <div>
    <a href="javascript:void(0)" on:click={doKensa}>検査</a>
    <a href="javascript:void(0)" on:click={doSearch}>検索入力</a>
    <a href="javascript:void(0)">重複削除</a>
    <a href="javascript:void(0)">全部コピー</a>
  </div>
</Pulldown>