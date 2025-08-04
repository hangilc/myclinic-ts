<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import SearchArea from "./SearchArea.svelte";


</script>

<ServiceHeader title="処方例管理" />
<div class="top">
  <div><SearchArea /></div>
  <div>RIGHT</div>
</div>

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
  }
</style>