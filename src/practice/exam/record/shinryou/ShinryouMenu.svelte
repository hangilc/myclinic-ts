<script lang="ts">
  import Pulldown from "@/lib/Pulldown.svelte"

  let auxLink: HTMLAnchorElement;
  let auxPopup: Pulldown;

  function doAux(): void {
    auxPopup.open();
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <a href="javascript:void(0)">[診療行為]</a>
  <a href="javascript:void(0)" bind:this={auxLink} on:click={doAux}>その他</a>
</div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={auxLink} bind:this={auxPopup}>
  <div>
    <a href="javascript:void(0)">検査</a>
    <a href="javascript:void(0)">検索入力</a>
    <a href="javascript:void(0)">重複削除</a>
    <a href="javascript:void(0)">全部コピー</a>
  </div>
</Pulldown>