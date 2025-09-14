<script lang="ts">
  import type { Writable } from "svelte/store";

  export let serviceStore: Writable<string>;

  function start(srv: string) {
    serviceStore.set(srv);
  }

  function menu(srv: string): () => void {
    return () => start(srv);
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
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
  <a href="javascript:void(0)" on:click={menu("ryouyou-keikakusho")}>療養計画書</a>
  <a href="javascript:void(0)" on:click={menu("houmon-kango")}>訪問看護</a>
  <a href="javascript:void(0)" on:click={menu("ryouyouhi-douisho")}>療養費同意書</a>
  <a href="javascript:void(0)" on:click={menu("shujii")}>主治医意見書</a>
  <a href="javascript:void(0)" on:click={menu("print-setting")}>印刷設定</a>
  <a href="javascript:void(0)" on:click={menu("scan")}>スキャン</a>
  <a href="javascript:void(0)" on:click={menu("refer")}>紹介状</a>
  <a href="javascript:void(0)" on:click={menu("shindansho")}>診断書</a>
  <a href="javascript:void(0)" on:click={menu("phone")}>電話</a>
  <a href="javascript:void(0)" on:click={menu("jihi-kenshin")}>自費健診</a>
  <a href="javascript:void(0)" on:click={menu("rcpt-check")}>レセプトチェック</a>
  <a href="javascript:void(0)" on:click={menu("rezept")}>レセプト</a>
  <a href="javascript:void(0)" on:click={menu("henrei")}>返戻</a>
  <a href="javascript:void(0)" on:click={menu("presc-example")}>処方例管理</a>
  <a href="javascript:void(0)" on:click={menu("shohou-usage")}>処方用法管理</a>
  <a href="javascript:void(0)" on:click={menu("modify-onshi")}>オン資サーバー</a>
  <a href="javascript:void(0)" on:click={menu("dx-kasan")}>ＤＸ加算設定</a>
  <a href="javascript:void(0)" on:click={menu("dup-patient")}>重複患者</a>
  <a href="javascript:void(0)" on:click={menu("edit-config")}>Config</a>
  <a href="javascript:void(0)" on:click={menu("big-char")}>大きい文字</a>
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
