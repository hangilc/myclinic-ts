<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  let show = false;
  export function open(): void {
    zIndexScreen = alloc();
    zIndexContent = alloc();
    show = true;
  }
  export let width: string = "260px";
  export let noTitle = false;
  export let onClose: () => void = () => {};

  let content: HTMLElement;
  let zIndexScreen: number;
  let zIndexContent: number;

  function close(): void {
    show = false;
    release(zIndexScreen);
    release(zIndexContent);
    onClose();
  }
</script>

{#if show}
  <div>
    <Screen opacity="0.5" zIndex={zIndexScreen} />
    <div
      bind:this={content}
      class="dialog"
      style:z-index={zIndexContent}
      style:width
    >
      {#if !noTitle}
        <div class="title-wrapper">
          <slot name="title" />
          <!-- <img src="/xicon.svg" alt="xicon" on:click={() => close()}/> -->
          <svg
            on:click={close}
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
      {/if}
      <slot {close} />
      <div class="commands">
        <slot name="commands" />
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog {
    position: fixed;
    top: 20px;
    left: 50vw;
    transform: translateX(-50%);
    background-color: white;
    padding: 0.5rem 1.5rem;
    opacity: 1;
    overflow: auto;
    border-radius: 0.5rem;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    font-weight: bold;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }
</style>
