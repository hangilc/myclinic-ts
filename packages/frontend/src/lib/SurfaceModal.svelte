<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let screenOpacity: string = "0";

  let zIndexScreen = alloc();
  let zIndexContent = alloc();

  const dispatch = createEventDispatcher();

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: screenOpacity,
      onClick: doScreenClick
    }
  });

  onDestroy(() => {
    screen.$destroy();
    release(zIndexContent);
        release(zIndexScreen);
  });

  function close(): void {
    dispatch("close");
  }

  function doScreenClick(): void {
    close();
  }

</script>

<div class="top" style:z-index={zIndexContent}>Dialog</div>

<style>
  .top {
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
</style>