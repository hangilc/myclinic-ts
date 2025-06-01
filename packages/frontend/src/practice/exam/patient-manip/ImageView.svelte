<script lang="ts">
  export let src: string;
  let scale = 1.0;
  let rotate = 0;

  function doEnlarge() {
	scale *= 1.25;
  }

  function doShrink() {
	scale /= 1.25;
  }

  function doRotateClockwise() {
	rotate = (rotate + 90) % 360;
  }

  function doRotateUnclockwise() {
	rotate = (rotate - 90) % 360;
  }
  
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="image-wrapper">
    <div
      class="image-content"
      style="width:800px;height:1130px;transform: scale({scale}) rotate({rotate}deg)"
    >
      {#if src}
        <img {src}/>
      {/if}
    </div>
  </div>
  {#if src}
    <div class="control">
      <a href="javascript:void(0)" on:click={doEnlarge}>拡大</a>
      <a href="javascript:void(0)" on:click={doShrink}>縮小</a>
      <a href="javascript:void(0)" on:click={doRotateClockwise}>右へ９０°</a>
      <a href="javascript:void(0)" on:click={doRotateUnclockwise}>左へ９０°</a>
    </div>
  {/if}
</div>

<style>
  .image-wrapper {
    width: 820px;
    height: 600px;
    overflow: auto;
    padding: 0;
    resize: both;
  }

  .image-content img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
