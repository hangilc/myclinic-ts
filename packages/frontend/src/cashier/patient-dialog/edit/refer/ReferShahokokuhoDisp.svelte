<script lang="ts">
  import type { Shahokokuho } from "myclinic-model";
  import ShahokokuhoInfo from "../../info/ShahokokuhoInfo.svelte";
  import { Hoken } from "../../hoken";

  export let shahokokuho: Shahokokuho;
  export let usageCount: number;

  let hoken: Hoken = new Hoken(shahokokuho, usageCount);

</script>

<ShahokokuhoInfo {hoken} patient={null} />