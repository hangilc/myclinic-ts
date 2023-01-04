<script lang="ts">
  export let opacity: string = "0";
  export let zIndex: number | undefined = undefined;
  export let onClick: (ev: Event) => void = (_) => {};
  export let postConstruct: (screen: HTMLElement) => void = _ => {};

  function doClick(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    onClick(ev);
  }

  function doKeydown(ev: KeyboardEvent): void {
    console.log("screen key down");
  }
</script>

<div class="screen-layer"
  style={`opacity: ${opacity}; z-index: ${zIndex}`}
  on:click={doClick}
  on:keydown={doKeydown}
  use:postConstruct
/>

<style>
  div {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #5a6268;
    overflow-y: auto;
  }
</style>
