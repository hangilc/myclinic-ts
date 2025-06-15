<script lang="ts">
  import { DateWrapper, sqlDateToOnshiDate, onshiDateToSqlDate } from "myclinic-util";

  export let onDone: () => void;
  export let onChange: (value: string | undefined) => void;
  export let 使用期限年月日: string | undefined;

  let inputText = 使用期限年月日
    ? onshiDateToSqlDate(使用期限年月日)
    : DateWrapper.from(new Date()).incDay(7).asSqlDate();

  function doEnter() {
    if (!DateWrapper.isSqlDate(inputText)) {
      alert("日付が適切でありません。YYYY-MM-DD expefcted");
      return;
    }
    onDone();
    onChange(sqlDateToOnshiDate(inputText));
  }

  function doDelete() {
    onDone();
    onChange(undefined);
  }
</script>

<div>有効期限</div>
<input type="text" bind:value={inputText} />
<div class="commands">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a href="javascript:void(0)" on:click={doDelete}>削除</a>
  <button on:click={doEnter}>入力</button>
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
