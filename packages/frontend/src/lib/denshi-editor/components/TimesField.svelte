<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { deserializeUneven, serializeUneven } from "../helper";
  import { tick } from "svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import { toHankaku, toZenkaku } from "@/lib/zenkaku";

  export let group: RP剤情報Edit;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  let inputText: string = inputValue();
  let inputElement: HTMLInputElement | undefined = undefined;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function inputValue(): string {
    return toHankaku(group.剤形レコード.調剤数量.toString());
  }

  function title(group: RP剤情報Edit): string {
    if (group.剤形レコード.剤形区分 === "内服") {
      return "日数";
    } else if (group.剤形レコード.剤形区分 === "頓服") {
      return "回数";
    } else {
      return "";
    }
  }

  function timesUnit(group: RP剤情報Edit): string {
    if (group.剤形レコード.剤形区分 === "内服") {
      return "日分";
    } else if (group.剤形レコード.剤形区分 === "頓服") {
      return "`回分";
    } else {
      return "";
    }
  }

  function isVisible(group: RP剤情報Edit): boolean {
    let zaikei = group.剤形レコード.剤形区分;
    return zaikei === "内服" || zaikei === "頓服";
  }

  function rep(group: RP剤情報Edit): string {
    if (group.剤形レコード.剤形区分 === "内服") {
      return `${toZenkaku(group.剤形レコード.調剤数量.toString())}日分`;
    } else if (group.剤形レコード.剤形区分 === "頓服") {
      return `${toZenkaku(group.剤形レコード.調剤数量.toString())}回分`;
    } else {
      return "";
    }
  }

  function doRepClick() {
    inputText = inputValue();
    isEditing = true;
    focus();
  }

  function doEnter() {
    let n = parseInt(toHankaku(inputText.trim()));
    if (isNaN(n)) {
      alert("日数・回数が整数でありません。");
      return;
    }
    if (n <= 0) {
      alert("日数・回数が正の整数でありません。");
      return;
    }
    group.剤形レコード.調剤数量 = n;
    isEditing = false;
    onFieldChange();
  }

  function doCancel() {
    isEditing = false;
  }
</script>

{#if isVisible(group)}
  <Field>
    <FieldTitle>{title(group)}</FieldTitle>
    <FieldForm>
      {#if !isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="rep" on:click={doRepClick}>
          {rep(group)}
        </div>
      {:else}
        <form on:submit|preventDefault={doEnter} class="with-icons">
          <input
            type="text"
            bind:value={inputText}
            bind:this={inputElement}
            class="input"
          />
          {timesUnit(group)}
          <SubmitLink onClick={doEnter} />
          <CancelLink onClick={doCancel} />
        </form>
      {/if}
    </FieldForm>
  </Field>
{/if}

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
