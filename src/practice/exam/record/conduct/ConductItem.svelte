<script lang="ts">
  import { ConductKindObject, type ConductEx, type ConductKindTag } from "@/lib/model";

  export let conduct: ConductEx;

  function kindRep(kindTag: ConductKindTag): string {
    return ConductKindObject.fromTag(kindTag).rep;
  }
</script>

<div>
  <div>[{kindRep(conduct.kind)}]</div>
</div>