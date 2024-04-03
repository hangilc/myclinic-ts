<script lang="ts">
  import type { DrawerContext } from "./compiler/context";
  import { createRendererData } from "./compiler/create-renderer";

  export let ctx: DrawerContext;

</script>

<pre>{createRendererData(ctx)}</pre>