<script lang="ts">
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import type { 剤形区分 } from "../denshi-shohou";
  import ChevronUp from "@/icons/ChevronUp.svelte";

  export let 剤形区分: 剤形区分;
  export let onChange: (zaikei: 剤形区分) => void;

  let showMore = isUsual(剤形区分) ? false : true;

  function isUsual(zaikei: 剤形区分): boolean {
    return zaikei === "内服" || zaikei === "頓服" || zaikei === "外用";
  }

  function doChange() {
    onChange(剤形区分);
  }

  function toggleMore() {
    showMore = !showMore;
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="option-wrapper">
  <div>
    <span
      ><input
        type="radio"
        bind:group={剤形区分}
        value="内服"
        on:change={doChange}
      /> 内服</span
    >
    <span
      ><input
        type="radio"
        bind:group={剤形区分}
        value="頓服"
        on:change={doChange}
      /> 頓服</span
    >
    <span
      ><input
        type="radio"
        bind:group={剤形区分}
        value="外用"
        on:change={doChange}
      /> 外用</span
    >
    {#if !showMore}
      <a
        href="javascript:void(0)"
        style="position:relative;top:3px;margin-left:2px;"
        on:click={toggleMore}
      >
        <ChevronDown />
      </a>
    {:else if isUsual(剤形区分)}
      <a
        href="javascript:void(0)"
        style="position:relative;top:3px;margin-left:2px;"
        on:click={toggleMore}
      >
        <ChevronUp />
      </a>
    {/if}
  </div>
  {#if showMore}
    <div>
      <span
        ><input
          type="radio"
          bind:group={剤形区分}
          value="内服滴剤"
          on:change={doChange}
        /> 内服滴剤</span
      >
      <span
        ><input
          type="radio"
          bind:group={剤形区分}
          value="注射"
          on:change={doChange}
        /> 注射</span
      >
      <span
        ><input
          type="radio"
          bind:group={剤形区分}
          value="医療材料"
          on:change={doChange}
        /> 医療材料</span
      >
      <span
        ><input
          type="radio"
          bind:group={剤形区分}
          value="不明"
          on:change={doChange}
        /> 不明</span
      >
    </div>
  {/if}
</div>

<style>
</style>
