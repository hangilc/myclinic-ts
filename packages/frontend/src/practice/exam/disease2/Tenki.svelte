<script lang="ts">
  import type { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";

  export let env: DiseaseEnv | undefined;
  export let doMode: (mode: Mode) => void;
</script>

<div>Tenki</div>
