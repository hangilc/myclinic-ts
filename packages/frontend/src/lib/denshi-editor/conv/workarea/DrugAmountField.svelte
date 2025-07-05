<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import CancelLink from "../../icons/CancelLink.svelte";
  import SubmitLink from "../../icons/SubmitLink.svelte";
  import { tick } from "svelte";
  import Field from "./Field.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import FieldForm from "./FieldForm.svelte";

  export let 分量: string;
  export let isEditing: boolean;
  export let 単位名: string;

  if (分量 === "") {
    isEditing = true;
  }

  let inputText: string = 分量;
  let inputElement: HTMLInputElement;

  async function focus() {
    await tick();
    if (inputElement) {
      inputElement.focus();
    }
  }

  function doEnter() {
    let f = parseFloat(toHankaku(inputText.trim()));
    if (isNaN(f)) {
      alert("分量の値が数値でありません。");
      return;
    }
    分量 = f.toString();
    inputText = 分量;
    isEditing = false;
  }

  function doCancel() {
    isEditing = false;
  }

  function doEdit() {
    inputText = 分量;
    isEditing = true;
  }
</script>

<Field>
  <FieldTitle>分量</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="rep" on:click={doEdit}>分量：{分量}{単位名}</div>
    {:else}
      <form on:submit|preventDefault={doEnter} class="with-icons">
        <input type="text" bind:value={inputText} bind:this={inputElement} />
        {単位名}
        <SubmitLink onClick={doEnter} />
        <CancelLink onClick={doCancel} />
      </form>
    {/if}
  </FieldForm>
</Field>

<style>
  input {
    width: 4em;
  }

  .rep {
    cursor: pointer;
  }
</style>
