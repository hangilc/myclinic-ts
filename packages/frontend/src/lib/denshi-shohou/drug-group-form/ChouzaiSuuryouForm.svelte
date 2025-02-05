<script lang="ts">
  export let 調剤数量: string;
  export let unit: string;
</script>

<input type="text" bind:value={調剤数量} style="width:5em" />
{unit}
