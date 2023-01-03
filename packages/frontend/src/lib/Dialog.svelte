<script lang="ts">
  import { ViewportCoord } from "./viewport-coord";
  import { alloc, release } from "./zindex";
  import Screen from "./Screen.svelte";
  import { onDestroy, onMount } from "svelte";

  export let destroy: () => void;
  export let title: string;
  export let onClose: () => void = () => {};

  let dialog: HTMLElement;

  let zIndexScreen = alloc();
  let zIndexDialog = alloc();
  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: "0.4"
    }
  });

  onDestroy(() => {
    if (zIndexDialog != undefined) {
      release(zIndexDialog);
    }
    if (zIndexScreen != undefined) {
      release(zIndexScreen);
    }
    screen.$destroy();
    onClose();
  });

  onMount(() => {
    dialog.style.zIndex = zIndexDialog.toString();
    const v = document.documentElement;
    // const d = dialog.getBoundingClientRect();
    // dialog.style.left = window.scrollX + v.clientWidth / 2 - d.width / 2 + "px";
  });

  function doMenuKey(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      destroy();
    }
  }
</script>

<div class="dialog" bind:this={dialog} >
  <div class="title">{title}</div>
  <slot />
</div>

<style>
  .dialog {
    position: fixed;
    margin: 0;
    top: 20px;
    left: 50vw;
    transform: translateX(-60%);
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid gray;
    background-color: white;
    opacity: 1;
    border-radius: 8px;
  }

  .dialog:focus {
    outline: none;
  }

  .title {
    font-weight: bold;
  }
</style>
