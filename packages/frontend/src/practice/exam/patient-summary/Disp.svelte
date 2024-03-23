<script lang="ts">
  export let content: string;
  export let onEdit: () => void;
  let showContent = true;

  function doCollapse() {
    showContent = false;
  }

  function doExtend() {
    showContent = true;
  }
</script>

{#if showContent}
  <pre class="content">{content}</pre>
{/if}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="commands">
  <a on:click={onEdit}>編集</a>
  {#if showContent}
    <a on:click={doCollapse}>圧縮</a>
  {:else}
    <a on:click={doExtend}>伸展</a>
  {/if}
</div>

<style>
  .content {
    height: 10em;
    overflow-y: auto;
    resize: vertical;
    white-space: pre-wrap;
  }
  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }

  .commands a {
    cursor: pointer;
  }
</style>
