<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { TextCommand } from "./text-commands";

  export let destroy: () => void;
  export let commands: TextCommand[];
  export let onEnter: (t: string) => void;

  function doClick(text: string): void {
    destroy();
    onEnter(text);
  }
</script>

<SurfaceModal {destroy} title="文章入力コマンド">
  <div>
    {#each commands as c}
      <div on:click={() => doClick(c.body)}>{c.command}</div>
    {/each}
  </div>
</SurfaceModal>