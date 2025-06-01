<script lang="ts">
  export let src: string;
  let content: HTMLElement;

  function doEnlarge() {
	if( content ){
	  let r = content.getBoundingClientRect();
	  let w = r.width;
	  content.style.width = `${w*1.25}px`;
	}
  }

  function doShrink() {
	if( content ){
	  let r = content.getBoundingClientRect();
	  let w = r.width;
	  content.style.width = `${w/1.25}px`;
	}
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="image-wrapper">
    <div class="image-content" bind:this={content}
	  style="width:800px;height:1130px;"
	>
      {#if src}
        <img {src} />
      {/if}
    </div>
  </div>
  {#if src}
    <div class="control">
      <a href="javascript:void(0)" on:click={doEnlarge}>拡大</a>
      <a href="javascript:void(0)" on:click={doShrink}>縮小</a>
    </div>
  {/if}
</div>

<style>
  .image-wrapper {
	width:820px;
	height:600px;
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
