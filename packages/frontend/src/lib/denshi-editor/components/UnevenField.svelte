<script lang="ts">
  import type { 不均等レコード } from "@/lib/denshi-shohou/presc-info";
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { deserializeUneven, serializeUneven } from "../helper";
  import { tick } from "svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let 不均等レコード: 不均等レコード;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  
  let inputText: string = serializeUneven(不均等レコード);
  let inputElement: HTMLInputElement | undefined = undefined;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function rep(不均等レコード: 不均等レコード): string {
    let s = serializeUneven(不均等レコード);
    if (s === "") {
      return "（なし）";
    } else {
      return s;
    }
  }

  function doRepClick() {
    inputText = serializeUneven(不均等レコード);
    isEditing = true;
    focus();
  }

  function doEnter() {
    let uneven = deserializeUneven(inputText);
    if( uneven ){
    try {
      不均等レコード = uneven;
      onFieldChange();
    } catch (e: any) {
      alert(e);
    }
  }
  }

  function doCancel() {
    isEditing = false;
  }

  function doDelete() {
    不均等レコード = undefined;
    onFieldChange();
  }
</script>

<Field>
  <FieldTitle>不均等レコード</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>
        {rep(不均等レコード)}
      </div>
    {:else}
      <form on:submit|preventDefault={doEnter} class="with-icons">
        <input type="text" bind:value={inputText} bind:this={inputElement} />
        <SubmitLink onClick={doEnter} />
        <CancelLink onClick={doCancel} />
        <TrashLink onClick={doDelete} />
      </form>
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
