<script lang="ts">
  import SubmitIconLink from "@/lib/widgets/SubmitIconLink.svelte";
  import CancelIconLink from "@/lib/widgets/CancelIconLink.svelte";

  export let value: string;
  export let label: string;
  let isEditing: boolean = false;
  let inputValue: string = "";

  $: updateInputValue(value);

  function updateInputValue(value: string) {
    inputValue = value;
  }

  function doRepClick() {
    isEditing = true;
  }

  function doEnter() {
    value = inputValue;
    isEditing = false;
  }

  function doCancel() {
    isEditing = false;
    updateInputValue(value);
  }
</script>

<div>
  <div class="title">{label}</div>
  {#if isEditing}
    <form class="form" on:submit|preventDefault={doEnter}>
      <input type="text" bind:value={inputValue} />
      <SubmitIconLink onClick={doEnter}/>
      <CancelIconLink onClick={doCancel}/>
    </form>
  {:else}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="rep" on:click={doRepClick}>{value || "（空白）"}</div>
  {/if}
</div>

<style>
  .title {
    font-weight: bold;
  }

  form {
    display: flex;
    align-items: center;
  }

  input {
    width: 26em;
  }

  .rep {
    cursor: pointer;
  }
</style>