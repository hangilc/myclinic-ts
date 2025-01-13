<script lang="ts">
  import type { 情報区分 } from "../denshi-shohou";

  export let 情報区分: 情報区分;
  export let onDone: (value: 情報区分) => void;

  function doEnter() {
    onDone(情報区分);
  }
</script>

<div>
  <span style="white-space:nowrap;"
    ><input type="radio" bind:group={情報区分} value="医薬品" on:change={doEnter}/>医薬品</span
  >
  <span style="white-space:nowrap;"
    ><input type="radio" bind:group={情報区分} value="医療材料" on:change={doEnter}/>医療材料</span
  >
</div>
