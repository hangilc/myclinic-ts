<script lang="ts">
  import CancelIconLink from "@/lib/widgets/CancelIconLink.svelte";
  import SubmitIconLink from "@/lib/widgets/SubmitIconLink.svelte";

  export let value: string | undefined;
  export let isEditing = false;
  export let placeholder: string = "";
  let inputValue: string = "";

  $: updateInputValue(value);

  function updateInputValue(value: string | undefined) {
    inputValue = value ?? "";
  }

  function doRepClick() {
    isEditing = true;
  }

  function rep(value: string | undefined): string {
    if (value) {
      return value;
    } else {
      return "（空白）";
    }
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

{#if isEditing}
  <form class="form" on:submit|preventDefault={doEnter}>
    <input type="text" bind:value={inputValue} placeholder={placeholder}/>
    <SubmitIconLink onClick={doEnter} />
    <CancelIconLink onClick={doCancel} />
  </form>
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <span class="rep" on:click={doRepClick}>{rep(value)}</span>
{/if}

<style>
  .rep {
    cursor: pointer;
  }

  form {
    display: flex;
    align-items: center;
  }

  form input {
    width: var(--editable-text-width, );
  }
</style>
