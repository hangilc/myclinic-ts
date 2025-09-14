<script lang="ts">
  export let value: string;
  let isEditing: boolean = false;
  let inputValue: string = "";

  $: updateInputValue(value);

  function updateInputValue(value: string) {
    inputValue = value;
  }
</script>

<div>
  <div class="title">住所</div>
  {#if isEditing}
    <input type="text" bind:value={inputValue} />
  {:else}
    <div>{value || "（空白）"}</div>
  {/if}
</div>

<style>
  .title {
    font-weight: bold;
  }
</style>