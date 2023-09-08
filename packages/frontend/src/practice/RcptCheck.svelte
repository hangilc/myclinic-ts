<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { pad } from "@/lib/pad";

  export let isVisible = false;
  let shinryouYearMonth: string = defaultShinryouYearMonth();

  function defaultShinryouYearMonth(): string {
    let now = new Date();
    const d = now.getDate();
    if (d <= 10) {
      now.setMonth(now.getMonth() - 1);
    }
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1, 2, "0");
    return `${y}${m}`;
  }

  async function doStart() {}
</script>

<div style:display={isVisible ? "" : "none"} class="wrapper">
  <ServiceHeader title="レセプトチェック" />
  <div>
    診療年月：<input type="text" bind:value={shinryouYearMonth} />
  </div>
  <div>
    <button on:click={doStart}>スタート</button>
  </div>
</div>

<style>
  .wrapper > div {
    margin-bottom: 10px;
  }
</style>
