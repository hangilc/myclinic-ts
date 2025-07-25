<script lang="ts">
  export let name: string;
  export let onClick: (name: string) => void;
</script>

<a href="javascript:void(0)" on:click={() => onClick(name)}>{name}</a>