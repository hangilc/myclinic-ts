<script lang="ts">
  import { reqChangePatient } from "./ExamVars";

  function onEndPatientClick() {
    reqChangePatient.set(null);
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top">
  <button>会計</button>
  <button on:click={onEndPatientClick}>患者終了</button>
  <a href="javascript:void(0)">診察登録</a>
  <a href="javascript:void(0)">文章検索</a>
  <a href="javascript:void(0)">画像保存</a>
  <a href="javascript:void(0)">画像一覧</a>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
  }
  * + button {
    margin-left: 4px;
  }
  * + a {
    margin-left: 4px;
  }
</style>