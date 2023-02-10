<script lang="ts">
  import SelectItem2 from "@/lib/SelectItem2.svelte";
  import type { ScannerDevice } from "myclinic-model/model";

  export let destroy: () => void;
  export let list: ScannerDevice[];
  export let current: ScannerDevice | undefined;
  export let onSelect: (d: ScannerDevice) => void;

  function doSelect(d: ScannerDevice): void {
    destroy();
    onSelect(d);
  }
</script>

<div data-cy="select-scanner-pulldown">
  {#each list as d}
    <SelectItem2 data={d} isCurrent={d === current} onSelect={doSelect}
      dataCy="scanner-item" dataId={encodeURIComponent(d.deviceId)}
      >{d.description}</SelectItem2
    >
  {/each}
</div>
