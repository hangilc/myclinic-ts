<script lang="ts">
  import Popup from "@/lib/Popup.svelte";
  import { isAdmin } from "./appoint-vars";
  import Bars3 from "@/icons/Bars3.svelte";

  export let onCreateAppoints: () => void;
  export let onMoveWeeks: (n: number) => void;
  export let onThisWeek: () => void;

  function doAlloc(destroy: () => void){
    destroy();
    onCreateAppoints();
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
    <Popup let:trigger let:destroy>
      <Bars3 onClick={trigger} style="cursor: pointer;" dy="-2px" width="18"/>
      <div slot="menu" class="context-menu">
        {#if isAdmin}
          <a href="javascript:void(0)" on:click={() => doAlloc(destroy)}>予約枠わりあて</a>
        {/if}
        <a href="javascript:void(0)">変更履歴</a>
      </div>
    </Popup>
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
    top: -2px;
  }

  button {
    margin-left: 0;
  }

  a {
    margin: 0 6px;
  }

  .context-menu a {
    display: block;
    margin-bottom: 4px;
  }

  .context-menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
