<script lang="ts">
  import { alloc, release } from "./zindex";
  import Screen from "./Screen.svelte";
  import { onDestroy, onMount } from "svelte";

  export let destroy: () => void;
  export let title: string;
  export let onClose: () => void = () => {};
  export let styleWidth: string = "";

  let dialog: HTMLElement;

  let zIndexScreen = alloc();
  let zIndexDialog = alloc();
  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: "0.4",
    },
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
    // const v = document.documentElement;
  });

  // function doMenuKey(event: KeyboardEvent): void {
  //   if (event.key === "Escape") {
  //     event.stopPropagation();
  //     destroy();
  //   }
  // }
</script>

<div class="dialog" bind:this={dialog} data-cy="dialog" data-title={title}
  style:width={styleWidth}>
  <div class="title" data-cy="dialog-title">
    <span>{title}</span>
    <svg
      on:click={destroy}
      class="closeIcon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="16px"
      height="16px"
      data-cy="cross-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .title span {
    font-weight: bold;
  }

  .closeIcon {
    cursor: pointer;
  }
</style>
