<script lang="ts">
  import api from "@/lib/api";
  import { validateDxKasanSeries } from "@/lib/dx-kasan";
  import ServiceHeader from "@/ServiceHeader.svelte";

  let editValue = "";

  doRefresh();

  async function doSend() {
    let t = editValue;
    let c: any = [];
    try {
      c = JSON.parse(t);
      validateDxKasanSeries(c);
    } catch (err) {
      alert(`invalid format: ${err}`);
    }
	await api.setConfig("dx-kasan", c);
  }

  async function doRefresh() {
    let value = (await api.getConfig("dx-kasan")) || "[\n\n]";
	let series = validateDxKasanSeries(value)
	editValue = JSON.stringify(series, undefined, 2);
  }
</script>

<ServiceHeader title="ＤＸ加算設定" />
<div>
  <textarea bind:value={editValue} />
</div>
<div class="commands">
  <button on:click={doSend}>送信</button>
  <button on:click={doRefresh}>取込</button>
</div>

<style>
  textarea {
    width: 30em;
    height: 30em;
  }

  .commands {
    margin-top: 6px;
  }
</style>
