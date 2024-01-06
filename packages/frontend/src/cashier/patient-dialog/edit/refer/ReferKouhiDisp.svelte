<script lang="ts">
  import type { Kouhi } from "myclinic-model";
  import KouhiInfo from "../../info/KouhiInfo.svelte";
  import { Hoken } from "../../hoken";

  export let kouhi: Kouhi;
  export let usageCount: number;

  let hoken: Hoken = new Hoken(kouhi, usageCount);

</script>

<KouhiInfo {hoken} patient={null} />