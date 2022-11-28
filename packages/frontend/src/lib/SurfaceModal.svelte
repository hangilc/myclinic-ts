<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let screenOpacity: string = "0.4";
  export let title: string = "Untitled";
  export let width: string = "auto";
  export let height: string = "auto";
  export let onClose: () => void = () => {};

  let zIndexScreen = alloc();
  let zIndexContent = alloc();

  const dispatch = createEventDispatcher();

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: screenOpacity,
      onClick: doScreenClick,
    },
  });

  onDestroy(() => {
    screen.$destroy();
    release(zIndexContent);
    release(zIndexScreen);
  });

  function close(): void {
    dispatch("close");
    onClose();
  }

  function doScreenClick(): void {
    close();
  }
</script>

<div
  class="top dialog-top"
  style:z-index={zIndexContent}
  style:width
  style:height
>
  <div class="title">
    <span class="title-span">{title}</span>
    <svg
      on:click={close}
      class="closeIcon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="16px"
      height="16px"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
  <slot {close} />
</div>

<style>
  .top {
    position: fixed;
    margin-top: 20px;
    margin-bottom: auto;
    margin-left: auto;
    margin-right: auto;
    width: 360px;
    height: auto;
    left: 0;
    right: 0;
    top: 0;
    background-color: white;
    padding: 0.5rem 1.5rem;
    opacity: 1;
    overflow: auto;
    border-radius: 0.5rem;
    border: 1px solid gray;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .title-span {
    font-weight: bold;
  }

  .closeIcon {
    cursor: pointer;
  }
</style>
