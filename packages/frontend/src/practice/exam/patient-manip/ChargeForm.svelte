<script lang="ts">
  export let initValue: string;
  export let onEnter: (value: number) => void;
  export let onCancel: () => void;

  function doEnter(): void {
    const n = parseInt(initValue);
    if( isNaN(n) ){
      alert("入力が数字でありません。");
    } else {
      if( Number.isInteger(n) && n >= 0 ){
        onEnter(n);
      } else {
        alert("入力がゼロ以上の整数でありません。")
      }
    }
  }
</script>

<div>
  請求金額：<input type="text" bind:value={initValue} />円
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={onCancel}>キャンセル</button>
  </div>
</div>

<style>
  input {
    width: 4em;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
  }
</style>
