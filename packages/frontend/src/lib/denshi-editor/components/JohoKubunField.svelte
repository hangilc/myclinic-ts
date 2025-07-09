<script lang="ts">
  import {type 情報区分 } from "@/lib/denshi-shohou/denshi-shohou";
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";

  export let 情報区分: 情報区分;
  export let isEditing: boolean;
  export let onFieldChange: () => void;

  function doRepClick() {
    isEditing = true;
  }

  function doChange() {
    onFieldChange();
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
      <input type="radio" value="医薬品" bind:group={情報区分} on:change={doChange} />医薬品
      <input type="radio" value="医療材料" bind:group={情報区分} on:change={doChange} />医療材料
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }
</style>