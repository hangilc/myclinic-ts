<script lang="ts">
  import Field from "../workarea/Field.svelte";
  import FieldTitle from "../workarea/FieldTitle.svelte";
  import FieldForm from "../workarea/FieldForm.svelte";
  import { tick } from "svelte";
  import SubmitLink from "../../icons/SubmitLink.svelte";
  import CancelLink from "../../icons/CancelLink.svelte";
  
  export let alias: string[];
  export let onFieldChange: () => void;
  let inputText: string = "";
  $: updateInputText(alias);
  let inputElement: HTMLInputElement | undefined = undefined;
  let isEditing = false;
  let orig = alias;

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
    alias = inputText.split(/[ 　,、|｜:：]+/).filter(t => t.trim() !== "");
    isEditing = false;
    onFieldChange();
  }

  function doCancel() {
    isEditing = false;
    alias = orig;
  }

  function rep(alias: string[]): string {
    if( alias.length === 0 ){
      return "（未設定）";
    } else {
      return alias.join(" ");
    }
  }
</script>

  <Field>
    <FieldTitle>薬品別名</FieldTitle>
    <FieldForm>
      {#if !isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="rep" on:click={doRepClick}>
          {rep(alias)}
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
    width: 3em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
