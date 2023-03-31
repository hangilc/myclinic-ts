<script lang="ts">
  import SurfaceModal from "./SurfaceModal.svelte";

  export let destroy: () => void;
  export let title: string;
  export let url: string;
  export let width: string = "500px";

</script>

<SurfaceModal {destroy} {title}>
  <img src={url} {width} alt={title}/>
</SurfaceModal>