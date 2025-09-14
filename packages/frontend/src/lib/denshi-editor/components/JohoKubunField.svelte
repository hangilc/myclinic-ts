<script lang="ts">
  import { type 情報区分 } from "@/lib/denshi-shohou/denshi-shohou";
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";

  export let 情報区分: 情報区分;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  let value: 情報区分 = 情報区分;

  function doRepClick() {
    isEditing = true;
  }

  function doSubmit() {
    情報区分 = value;
    isEditing = false;
    onFieldChange();
  }

  function doCancel() {
    value = 情報区分;
    isEditing = false;
  }
</script>

<Field>
  <FieldTitle>情報区分</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>{情報区分}</div>
    {:else}
      <div class="form">
        <input
          type="radio"
          value="医薬品"
          bind:group={value}
        />医薬品
        <input
          type="radio"
          value="医療材料"
          bind:group={value}
        />医療材料
        <SubmitLink onClick={doSubmit} />
        <CancelLink onClick={doCancel} />
      </div>
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .form {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
