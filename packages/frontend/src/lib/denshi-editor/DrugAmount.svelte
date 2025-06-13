<script lang="ts">
  export let 分量: string;
  export let 単位名: string;

 </script>

分量：<input type="text" bind:value={分量}/> {単位名}

<style>
  input {
	width: 4em;
  }
</style>



