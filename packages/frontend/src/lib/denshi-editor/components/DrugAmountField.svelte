<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { tick } from "svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import type { 薬品情報Edit } from "../denshi-edit";
  import { toHankaku } from "@/lib/zenkaku";

  export let drug: 薬品情報Edit;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  let inputText: string = inputValue();
  let inputElement: HTMLInputElement | undefined = undefined;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function inputValue(): string {
    return toHankaku(drug.薬品レコード.分量);
  }

  function doRepClick() {
    inputText = inputValue();
    isEditing = true;
    console.log("amount click", drug);
    focus();
  }

  function doEnter() {
    let n = parseFloat(toHankaku(inputText.trim()));
    if (isNaN(n)) {
      alert("薬品分量が数値でありません。");
      return;
    }
    if (n <= 0) {
      alert("薬品分量が正の数値でありません。");
      return;
    }
    drug.薬品レコード.分量 = n.toString();
    isEditing = false;
    onFieldChange();
  }

  function doCancel() {
    isEditing = false;
  }
</script>

  <Field>
    <FieldTitle>薬品分量</FieldTitle>
    <FieldForm>
      {#if !isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
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
