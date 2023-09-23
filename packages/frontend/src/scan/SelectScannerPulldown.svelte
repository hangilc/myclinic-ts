<script lang="ts">
  import Popup from "@/lib/Popup.svelte";
  import SelectItem2 from "@/lib/SelectItem2.svelte";
  import { contextMenuLocator } from "@/lib/popup-helper";
  import type { ScannerDevice } from "myclinic-model/model";

  export let destroy: () => void;
  export let event: MouseEvent;
  export let list: ScannerDevice[];
  export let current: ScannerDevice | undefined;
  export let onSelect: (d: ScannerDevice) => void;
</script>

<Popup let:dispose {destroy} locator={contextMenuLocator(event)}>
  {#each list as d}
    <SelectItem2
      data={d}
      isCurrent={d === current}
      onSelect={(d) => { dispose(); onSelect(d)}}
      dataCy="scanner-item"
      dataId={encodeURIComponent(d.deviceId)}>{d.description}</SelectItem2
    >
  {/each}
</Popup>

