<script lang="ts">
  export let 分量: string;
  export let 単位名: string;

  let isEditing = false;
  if( !分量 ){
	isEditing = true;
  }
</script>

{#if isEditing}
  分量：<input type="text" bind:value={分量}/> {単位名}
{/if}

<style>
  input {
	width: 4em;
  }
</style>



