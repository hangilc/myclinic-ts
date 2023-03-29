<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { dragStart } from "./drag";
  import { alloc, release } from "./zindex";

  export let title: string;
  export let destroy: () => void;
  let zIndex: number = alloc();
  let floating: HTMLElement;
  let titleElement: HTMLElement;

  onDestroy(() => {
    release(zIndex);
  });

  onMount(() => {
    floating.style.zIndex = zIndex.toString();
    dragStart(titleElement, floating);
  });

  function doClose() {
    console.log("doClose");
    destroy();
  }
</script>

<div class="floating" bind:this={floating}>
  <div class="title-wrapper">
    <div class="title" bind:this={titleElement}>{title}</div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor" 
      width="18"
      style="position:relative;top:-1px;"
      on:click={doClose}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
  <slot>Floating Window</slot>
</div>

<style>
  .floating {
    position: absolute;
  }

  .title-wrapper {
    user-select: none;
    background-color: #eee;
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .title {
    display: inline-block;
    flex-grow: 1;
  }

  .title-wrapper svg {
    cursor: default;
  }
</style>
