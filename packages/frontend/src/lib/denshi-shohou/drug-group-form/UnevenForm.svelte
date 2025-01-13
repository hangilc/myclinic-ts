<script lang="ts">
  import type { 不均等レコード } from "../presc-info";

  export let 不均等レコード: 不均等レコード | undefined;
  export let onDone: (value: 不均等レコード | undefined) => void;
  let 不均等１回目服用量 = "";
  let 不均等２回目服用量 = "";
  let 不均等３回目服用量 = "";
  let 不均等４回目服用量 = "";
  let 不均等５回目服用量 = "";
</script>

<div>
  <div>
    １回目服用量 <input
      type="text"
      bind:value={不均等１回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ２回目服用量 <input
      type="text"
      bind:value={不均等２回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ３回目服用量 <input
      type="text"
      bind:value={不均等３回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ４回目服用量 <input
      type="text"
      bind:value={不均等４回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ５回目服用量 <input
      type="text"
      bind:value={不均等５回目服用量}
      style="width:4em"
    />
  </div>
</div>
