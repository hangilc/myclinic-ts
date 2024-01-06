<script lang="ts">
  import type { Koukikourei } from "myclinic-model";
  import KoukikoureiInfo from "../../info/KoukikoureiInfo.svelte";
  import { Hoken } from "../../hoken";

  export let koukikourei: Koukikourei;
  export let usageCount: number;

  let hoken: Hoken = new Hoken(koukikourei, usageCount);

</script>

<KoukikoureiInfo {hoken} patient={null} />