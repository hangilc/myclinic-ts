<script lang="ts">
  export let src: string;

  let width = 100;

  function doEnlarge() {
    width *= 1.25;
  }

  function doShrink() {
    width /= 1.25;
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="image-wrapper">
    <img {src} style="width:{width}%;height:100%;object-fit:contain;" />
  </div>
  <div>
    <a href="javascript:void(0)" on:click={doEnlarge}>拡大</a>
    <a href="javascript:void(0)" on:click={doShrink}>縮小</a>
  </div>
</div>

<style>
  .image-wrapper {
    overflow: auto;
  }
</style>
