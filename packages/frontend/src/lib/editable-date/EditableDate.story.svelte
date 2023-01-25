<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import EditableDate from "./EditableDate.svelte";

  export let Hst: Hst;
  let date: Date | null = new Date();
</script>

<Hst.Story>
  <EditableDate bind:date />
</Hst.Story>

