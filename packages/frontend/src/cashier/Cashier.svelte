<script lang="ts">
  import { openDateFormPulldown } from "@/lib/date-form/date-form-pulldown-op";
  import TopBlock from "./TopBlock.svelte";

  function doClick(ev: MouseEvent): void {
    openDateFormPulldown(new Date(), ev.target as HTMLElement, (d) => console.log(d),
      true);
  }
</script>

<div>
  <TopBlock />
  <button on:click={doClick}>click</button>
</div>