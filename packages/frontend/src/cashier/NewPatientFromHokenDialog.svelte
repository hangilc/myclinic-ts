<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { valid, type VResult } from "@/lib/validation";

  export let destroy: () => void;
  let mode: "shahokokuho" | "koukikourei" = "shahokokuho";
  let validateBirthdate: () => VResult<Date | null>;
  let error: string = "";

  function doClose(): void {
    destroy();
  }

  function doEnter() {
    const validatedBirthdate = validateBirthdate();
    if( validatedBirthdate.isError ){
      error = validatedBirthdate.errorMessages.join("\n");
      return;
    }
    const birthdate = validatedBirthdate.value;
    if( !birthdate ){
      error = "生年月日が入力されていません。";
      return;
    }
    const q = {
      hokensha: ""
    }
  }
</script>

<Dialog title="保険証から患者登録" destroy={doClose}>
  <div>
    <input
      type="radio"
      name="mode"
      bind:group={mode}
      value="shahokokuho"
    />社保国保
    <input
      type="radio"
      name="mode"
      bind:group={mode}
      value="koukikourei"
    />後期高齢
  </div>
  {#if error !== ""}
    <div class="error">{error}</div>
  {/if}
  <div>
    <div class="input-row">
      <span class="input-key">生年月日：</span>
      <div class="input-block birthday-input" data-cy="birthday-input-wrapper">
        <DateFormWithCalendar init={null} bind:validate={validateBirthdate}/>
      </div>
    </div>
    <div class="input-row">
      <span class="input-key">保険者番号：</span><input type="text" />
    </div>
  </div>
  {#if mode === "shahokokuho"}
    <div class="input-row">
      <span class="input-key">被保険者記号：</span><input type="text" />
    </div>
    <div class="input-row">
      <span class="input-key">被保険者番号：</span><input type="text" />
    </div>
  {:else}
    <div class="input-row">
      <span class="input-key">被保険者番号：</span><input type="text" />
    </div>
  {/if}
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .input-row {
    margin: 6px 0;
  }

  .input-key {
    display: inline-block;
    width: 12ch;
    text-align: right;
  }

  .input-block {
    display: inline-block;
  }

  .error {
    padding: 10px;
    color: red;
    border: 1px solid red;
    margin: 10px 0;
  }

  .commands {
    display: flex;
    justify-content: right;
  }
  .commands * + * {
    margin-left: 4px;
  }
</style>
