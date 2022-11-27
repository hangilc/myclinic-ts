<script lang="ts">

  import SurfaceModal from "@/lib/SurfaceModal.svelte";

  function doClick(): void {
    const m = new SurfaceModal({
      target: document.body,
      props: {
        screenOpacity: "0.3"
      }
    });

    m.$on("close", () => {
      m.$destroy();
    })
  }

</script>

<div>
  <div>SCAN</div>
  <button on:click={doClick}>click</button>
</div>