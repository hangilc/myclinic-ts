<script lang="ts">
  import AppointMenuPulldown from "./AppointMenuPulldown.svelte";

  export let onCreateAppoints: () => void;

  function doMenu(event: MouseEvent): void {
    const d: AppointMenuPulldown = new AppointMenuPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: event.target as SVGSVGElement,
        onCreateAppoints
      },
    });
  }
</script>

<div class="top">
  <button>前の月</button>
  <button>前の週</button>
  <a href="javascript:void(0)">今週</a>
  <button>次の週</button>
  <button>次の月</button>
  <div class="menu">
    <a href="javascript:void(0)">予約検索</a>
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
</style>
