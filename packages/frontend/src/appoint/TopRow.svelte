<script lang="ts">
  import AppointMenuPulldown from "./AppointMenuPulldown.svelte";

  export let onCreateAppoints: () => void;
  export let onMoveWeeks: (n: number) => void;
  export let onThisWeek: () => void;

  let svgWrapper: HTMLElement;

  function doMenu(event: MouseEvent): void {
    const d: AppointMenuPulldown = new AppointMenuPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: svgWrapper,
        onCreateAppoints,
      },
    });
  }
</script>

<div class="top">
  <button on:click={() => onMoveWeeks(-4)}>前の月</button>
  <button on:click={() => onMoveWeeks(-1)}>前の週</button>
  <a href="javascript:void(0)" on:click={onThisWeek}>今週</a>
  <button on:click={() => onMoveWeeks(1)}>次の週</button>
  <button on:click={() => onMoveWeeks(4)}>次の月</button>
  <div class="menu">
    <a href="javascript:void(0)">予約検索</a>
    <div class="svg-wrapper" bind:this={svgWrapper}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        width="18"
        class="menu-icon"
        on:click={doMenu}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </div>
  </div>
</div>

<style>
  .top {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .menu {
    display: inline-flex;
    align-items: center;
    float: right;
    line-height: 1;
  }

  .menu-icon {
    color: gray;
    cursor: pointer;
    position: relative;
    top: -1px;
  }

  button {
    margin-left: 0;
  }

  a {
    margin: 0 6px;
  }

  .svg-wrapper {
    display: inline-block;
    margin: 0;
    padding: 0;
  }
</style>
