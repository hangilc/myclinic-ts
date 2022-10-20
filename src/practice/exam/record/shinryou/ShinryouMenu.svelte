<script lang="ts">
  import Pulldown from "@/lib/Pulldown.svelte"
  import api from "@/lib/api"
  import RegularDialog from "./RegularDialog.svelte"
  import type { VisitEx } from "@/lib/model"
    import KensaDialog from "./KensaDialog.svelte";

  export let visit: VisitEx;
  let auxLink: HTMLAnchorElement;
  let auxPopup: Pulldown;
  let regularDialog: RegularDialog;
  let regularNames: Record<string, string[]> = {
    left: [],
    right: [],
    bottom: []
  };
  let kensaDialog: KensaDialog;
  let kensa: Record<string, string[]> = {
    left: [],
    right: [],
    preset: []
  };


  function doAux(): void {
    auxPopup.open();
  }
  
  async function doRegular() {
    if( regularNames.left.length === 0 ){
      regularNames = await api.getShinryouRegular();
    }
    regularDialog.open();
  }

  async function doKensa() {
    kensa = await api.getShinryouKensa();
    kensaDialog.open(kensa);
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <a href="javascript:void(0)"  on:click={doRegular}>[診療行為]</a>
  <a href="javascript:void(0)" bind:this={auxLink} on:click={doAux}>その他</a>
</div>

<RegularDialog bind:this={regularDialog} bind:names={regularNames} visit={visit}/>
<KensaDialog bind:this={kensaDialog} visit={visit} />

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={auxLink} bind:this={auxPopup}>
  <div>
    <a href="javascript:void(0)" on:click={doKensa}>検査</a>
    <a href="javascript:void(0)">検索入力</a>
    <a href="javascript:void(0)">重複削除</a>
    <a href="javascript:void(0)">全部コピー</a>
  </div>
</Pulldown>