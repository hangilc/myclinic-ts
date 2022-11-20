<script lang="ts" context="module">
  declare var Twilio: any;
</script>

<script lang="ts">
  import api from "@/lib/api";
  import { connect, disconnect } from "@/lib/twilio";

  export let isVisible: boolean;

  let phoneNumberValue: string = "";

  async function doCall(): Promise<void> {
    connect(phoneNumberValue);
  }

  function doHangup(): void {
    disconnect();
  }
</script>

<div style:display={isVisible ? "" : "none"}>
  <input type="text" bind:value={phoneNumberValue} />
  <button on:click={doCall}>発信</button>
  <button on:click={doHangup}>終了</button>
</div>