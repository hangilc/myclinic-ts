<script lang="ts">
  import type { 剤形区分 } from "../denshi-shohou";

  export let 剤形区分: 剤形区分;
  export let onDone: (zaikei: 剤形区分) => void;

  function doEnter() {
    onDone(剤形区分);
  }

</script>

<div class="option-wrapper">
  <span><input type="radio" bind:group={剤形区分} value="内服" on:change={doEnter}/> 内服</span>
  <span><input type="radio" bind:group={剤形区分} value="頓服" on:change={doEnter}/> 頓服</span>
  <span><input type="radio" bind:group={剤形区分} value="外用" on:change={doEnter}/> 外用</span>
  <span
    ><input type="radio" bind:group={剤形区分} value="内服滴剤" on:change={doEnter}/> 内服滴剤</span
  >
  <span><input type="radio" bind:group={剤形区分} value="注射" on:change={doEnter}/> 注射</span>
  <span
    ><input type="radio" bind:group={剤形区分} value="医療材料" on:change={doEnter}/> 医療材料</span
  >
  <span><input type="radio" bind:group={剤形区分} value="不明" on:change={doEnter}/> 不明</span>
</div>

<style>
  .option-wrapper > span {
    white-space: nowrap;
  }
</style>
