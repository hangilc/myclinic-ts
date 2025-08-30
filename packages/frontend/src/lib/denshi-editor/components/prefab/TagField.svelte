<script lang="ts">
  import Field from "../workarea/Field.svelte";
  import FieldTitle from "../workarea/FieldTitle.svelte";
  import FieldForm from "../workarea/FieldForm.svelte";
  import { tick } from "svelte";
  import SubmitLink from "../../icons/SubmitLink.svelte";
  import CancelLink from "../../icons/CancelLink.svelte";
  
  export let tag: string[];
  export let onFieldChange: () => void;
  let inputText: string = "";
  $: updateInputText(tag);
  let inputElement: HTMLInputElement | undefined = undefined;
  let isEditing = false;

  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function updateInputText(value: string[]) {
    inputText = value.join(" ");
  }

  function doRepClick() {
    isEditing = true;
    focus();
  }

  function doEnter() {
    tag = inputText.split(/[ 　,、|｜:：]+/).filter(t => t.trim() !== "");
    isEditing = false;
    onFieldChange();
  }

  function doCancel() {
    isEditing = false;
  }

  function rep(tag: string[]): string {
    if( tag.length === 0 ){
      return "（なし）";
    } else {
      return tag.join(" ");
    }
  }
</script>

  <Field>
    <FieldTitle>タグ</FieldTitle>
    <FieldForm>
      {#if !isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="rep" on:click={doRepClick}>
          {rep(tag)}
        </div>
      {:else}
        <form on:submit|preventDefault={doEnter} class="with-icons">
          <input
            type="text"
            bind:value={inputText}
            bind:this={inputElement}
            class="input"
          />
          <SubmitLink onClick={doEnter} />
          <CancelLink onClick={doCancel} />
        </form>
      {/if}
    </FieldForm>
  </Field>

<style>
  .rep {
    cursor: pointer;
  }

  .input {
    width: 20em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
