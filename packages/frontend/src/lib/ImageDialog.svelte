<script lang="ts">
  import Dialog from "./Dialog.svelte";

  export let destroy: () => void;
  export let title: string;
  export let url: string;
  export let width: string = "500px";

</script>

<Dialog {destroy} {title}>
  <img src={url} {width} alt={title}/>
</Dialog>
