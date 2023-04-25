<script type="ts">
  import type { Writable } from "svelte/store";

  export let serviceStore: Writable<string>;

  function start(srv: string) {
    serviceStore.set(srv);
  }
</script>

<div class="top">
  <a
    href="javascript:void(0);"
    on:click={(_) => start("exam")}
    class:current={$serviceStore === "exam"}>診察</a
  >
  <a
    href="javascript:void(0)"
    on:click={(_) => start("cashier")}
    class:current={$serviceStore === "cashier"}>会計</a
  >
  <a href="javascript:void(0)">受付</a>
  <a href="javascript:void(0)">ファックス済処方箋</a>
  <a href="javascript:void(0)">訪問介護</a>
  <a href="javascript:void(0)">主治医意見書</a>
  <a href="javascript:void(0)">ファックス送信</a>
  <a href="javascript:void(0)">印刷設定</a>
  <a href="javascript:void(0)">紹介状</a>
  <a href="javascript:void(0)">診断書</a>
  <a href="javascript:void(0)" on:click={(_) => start("phone")}>電話</a>
  <a href="javascript:void(0)" on:click={(_) => start("jihi-kenshin")}>自費健診</a>
</div>

<style>
  .top {
    background-color: #eee;
    padding: 6px;
  }

  a {
    display: block;
  }

  a.current {
    font-weight: bold;
  }
</style>
