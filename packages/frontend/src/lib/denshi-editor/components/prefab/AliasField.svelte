<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { tick } from "svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import type { 薬品情報Edit } from "../denshi-edit";
  import { toHankaku } from "@/lib/zenkaku";
  import type { 薬品情報 } from "@/lib/denshi-shohou/presc-info";

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
    inputText = value.join("|");
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
</script>

  <Field>
    <FieldTitle>薬品分量</FieldTitle>
    <FieldForm>
      {#if !isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="rep" on:click={doRepClick}>
          {drug.薬品レコード.分量 || "（未設定）"}{drug.薬品レコード.単位名}
        </div>
      {:else}
        <form on:submit|preventDefault={doEnter} class="with-icons">
          <input
            type="text"
            bind:value={inputText}
            bind:this={inputElement}
            class="input"
          />{drug.薬品レコード.単位名}
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
