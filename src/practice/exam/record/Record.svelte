<script lang="ts">
  import type * as m from "../../../lib/model";
    import Title from "./Title.svelte";

  export let visit: m.VisitEx;
</script>

<div>
  <Title visit={visit} />
</div>