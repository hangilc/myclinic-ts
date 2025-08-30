<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
import { connect, disconnect } from "@/lib/twilio";

  let phoneNumberValue: string = "";
  // let defaultInput: HTMLInputElement;

  function getPhoneNumber(): string | undefined {
    let n = phoneNumberValue.trim();
    n = n.replaceAll(/[-()) ]/g, "");
    if( /^\d{8}$/.test(n) ){
      n = `03${n}`;
    }
    if( n.startsWith("0") ){
      n = n.substring(1);
    }
    if( !n.startsWith("+") ){
      n = `+81${n}`;
    }
    return n;
  }

  async function doCall() {
    const n = getPhoneNumber();
    if( n ){
      console.log("calling", n);
      connect(n);
    } else {
      alert("Invalid phone number");
    }
  }

  function doHangup(): void {
    disconnect();
  }

  function setFocus(e: HTMLInputElement){
    e.focus();
  }
</script>

<ServiceHeader title="電話" />
<div>
  <input type="text" bind:value={phoneNumberValue} use:setFocus />
  <button on:click={doCall}>発信</button>
  <button on:click={doHangup}>終了</button>
</div>