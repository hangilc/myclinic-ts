<script lang="ts">
  import { type 剤形区分 } from "@/lib/denshi-shohou/denshi-shohou";
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import ChevronDownLink from "../icons/ChevronDownLink.svelte";
  import ChevronUpLink from "../icons/ChevronUpLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";

  export let 剤形区分: 剤形区分;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  let value: 剤形区分 = 剤形区分;
  let showMore = false;

  function doRepClick() {
    isEditing = true;
  }

  function doSubmit() {
    剤形区分 = value;
    onFieldChange();
    isEditing = false;
  }

  function toggleMore() {
    showMore = !showMore;
  }

  function isUsual(zaikei: 剤形区分): boolean {
    return zaikei === "内服" || zaikei === "頓服" || zaikei === "外用";
  }

  function doCancel() {
    value = 剤形区分;
    isEditing = false;
  }
</script>

<Field>
  <FieldTitle>剤形区分</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>{剤形区分}</div>
    {:else}
      <div>
        <div class="usual">
          <span
            ><input
              type="radio"
              bind:group={value}
              value="内服"
            /> 内服</span
          >
          <span
            ><input
              type="radio"
              bind:group={value}
              value="頓服"
            /> 頓服</span
          >
          <span
            ><input
              type="radio"
              bind:group={value}
              value="外用"
            /> 外用</span
          >
          <SubmitLink onClick={doSubmit} />
          <CancelLink onClick={doCancel} />
          {#if !showMore}
            <ChevronDownLink onClick={toggleMore} />
          {:else if isUsual(剤形区分)}
            <ChevronUpLink onClick={toggleMore} />
          {/if}
        </div>
        {#if showMore}
          <div>
            <span
              ><input
                type="radio"
                bind:group={value}
                value="内服滴剤"
              /> 内服滴剤</span
            >
            <span
              ><input
                type="radio"
                bind:group={value}
                value="注射"
              /> 注射</span
            >
            <span
              ><input
                type="radio"
                bind:group={value}
                value="医療材料"
              /> 医療材料</span
            >
            <span
              ><input
                type="radio"
                bind:group={value}
                value="不明"
              /> 不明</span
            >
          </div>
        {/if}
      </div>
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .usual {
    display: flex;
    align-items: center;
  }
</style>
