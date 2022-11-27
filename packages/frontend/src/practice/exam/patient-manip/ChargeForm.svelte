<script lang="ts">
  export let initValue: string;
  export let onEnter: (value: number) => void;
  export let onCancel: () => void;
  export let meisaiChargeValue: number | undefined = undefined;

  function doEnter(): void {
    const n = parseInt(initValue);
    if (isNaN(n)) {
      alert("入力が数字でありません。");
    } else {
      if (Number.isInteger(n) && n >= 0) {
        onEnter(n);
      } else {
        alert("入力がゼロ以上の整数でありません。");
      }
    }
  }

  function activateInput(e: HTMLInputElement): void {
    e.focus();
    e.select();
  }

  function doDefault(): void {
    if( meisaiChargeValue !== undefined ){
      initValue = meisaiChargeValue.toString();
    }
  }
</script>

<div>
  請求金額：<input type="text" bind:value={initValue} use:activateInput />円
  <div class="commands">
    <a href="javascript:void(0)" on:click={doDefault}>既定値</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={onCancel}>キャンセル</button>
  </div>
</div>

<style>
  input {
    width: 4em;
    margin-right: 4px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
