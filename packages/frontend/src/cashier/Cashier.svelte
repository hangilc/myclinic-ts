<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
import TopBlock from "./TopBlock.svelte";

</script>

<div>
  <TopBlock />
  <EditableDate date={new Date} />
</div>