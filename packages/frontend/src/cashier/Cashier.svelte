<script lang="ts">
  import DateFormPulldown from "@/lib/date-form/DateFormPulldown.svelte";
  import TopBlock from "./TopBlock.svelte";

  let errors: string[] = [];
  let pulldown: DateFormPulldown;
  function onEnter(d: Date | null): void {
    console.log(d);
  }
  function doClick(): void {
    pulldown.open(new Date());
  }
</script>

<div>
  <TopBlock />
  <DateFormPulldown bind:errors={errors} onEnter={onEnter} bind:this={pulldown} isNullable/>
  <button on:click={doClick}>click</button>
</div>