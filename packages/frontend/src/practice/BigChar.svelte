<script lang="ts">
  export let isVisible = false;
  let chr = "";
</script>

{#if isVisible}
<div class="top">
  <input type="text" bind:value={chr}/>
  <div class="big">{chr}</div>
</div>
{/if}

<style>
  .top {
    margin: 10px;
  }

  input {
    font-size: 20px;
  }

  .big {
    margin-top: 10px;
    font-size: 300px;
    font-family: serif;
  }
</style>