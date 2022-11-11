<script lang="ts">
  export let chargeValue: number;
  export let onEnter: () => void;
  export let onCancel: () => void;
</script>

<div>
  請求金額：<input type="text" bind:value={chargeValue} />円
  <div class="commands">
    <button on:click={onEnter}>入力</button>
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
