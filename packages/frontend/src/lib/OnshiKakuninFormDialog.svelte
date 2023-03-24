<script lang="ts">
  import type { OnshiResult } from "onshi-result";
  import Dialog from "./Dialog.svelte";
  import EditableDate from "./editable-date/EditableDate.svelte";
  import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
  import OnshiKakuninFormItem from "./OnshiKakuninFormItem.svelte";
  import { dateToSql } from "./util";

  export let destroy: () => void;
  let hokensha: string = "";
  let kigou: string = "";
  let hihokensha: string = "";
  let edaban: string = "";
  let birthdate: Date = new Date(2000, 0, 1);
  let limitConfirm: string = "1";
  let confirmDate: Date = new Date();
  let result: OnshiResult | undefined = undefined;

  async function doConfirm() {
    result = undefined;
    const q: OnshiKakuninQuery = {
      hokensha,
      hihokensha,
      birthdate: dateToSql(birthdate),
      confirmationDate: dateToSql(confirmDate),
      kigou,
      edaban,
      limitAppConsFlag: limitConfirm,
    };
    result = await onshiConfirm(q);
  }
</script>

<Dialog {destroy} title="オンライン資格確認フォーム" styleWidth="320px">
  <form class="form">
    <span class="required">保険者番号</span>
    <input type="text" bind:value={hokensha} />
    <span>被保険者記号</span>
    <input type="text" bind:value={kigou} />
    <span class="required">被保険者番号</span>
    <input type="text" bind:value={hihokensha} />
    <span>枝番</span>
    <input type="text" bind:value={edaban} />
    <span class="required">生年月日</span>
    <EditableDate bind:date={birthdate} />
    <span class="required">限度額確認</span>
    <div class="input">
      <input
        type="radio"
        name="limit-confirm"
        value="0"
        bind:group={limitConfirm}
      />
      未同意
      <input
        type="radio"
        name="limit-confirm"
        value="1"
        bind:group={limitConfirm}
      /> 同意
    </div>
    <span class="required">確認日</span>
    <div class="input">
      <EditableDate bind:date={confirmDate} />
    </div>
  </form>
  <div class="commands">
    <button on:click={doConfirm}>確認</button>
  </div>
  {#if result}
    <div class="result">
      {#if result.isValid && result.resultList.length > 0}
        <div class="ok-result">
          {#each result.resultList as item}
            <OnshiKakuninFormItem result={item} />
          {/each}
        </div>
      {:else}
        <div class="error-result">
          <div>資格確認失敗</div>
          <div>{result.messageBody.qualificationValidity ?? ""}</div>
          <div>{result.messageBody.processingResultMessage ?? ""}</div>
        </div>
      {/if}
    </div>
  {/if}
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

  .required::after {
    content: "*";
    color: red;
  }

  .input {
    display: inline-block;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin: 10px 0;
  }

  .result {
    margin-top: 10px;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
</style>
