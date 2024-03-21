<script lang="ts">
  export let content: string;
  export let onEdit: () => void;
</script>

<div>
  {content}
</div>
<div><button on:click={onEdit}>編集</button></div>