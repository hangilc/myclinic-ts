<script lang="ts">
  import Dialog from "./Dialog.svelte";

  export let destroy: () => void;
</script>

<Dialog destroy={destroy} title="オンライン資格確認フォーム">
  <form class="form">
    <span>保険者番号<span class="required">*</span></span>
    <input type="text" />
    <span>被保険者記号</span>
    <input type="text" />
    <span>被保険者番号<span class="required">*</span></span>
    <input type="text" />
    <span>枝番<span class="required">*</span></span>
    <input type="text" />
    <span>生年月日<span class="required">*</span></span>
    <input type="text" />
    <span>限度額確認<span class="required">*</span></span>
    <div class="input">
      <input type="radio" name="limit-confirm" value="0"> 未同意
      <input type="radio" name="limit-confirm" value="1"> 同意
    </div>
  </form>
</Dialog>

<style>
  .form {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .form > *:nth-child(odd) {
    margin-right: 10px;
  }

  .form input {
    margin: 2px 0;
  }

  .required {
    color: red;
  }

  .input {
    display: inline-block;
  }
</style>
