<script lang="ts">
	import { cache } from "@/lib/cache";
	import ServiceHeader from "@/ServiceHeader.svelte";

	let onshiServer: string = "";

	init();

	async function init() {
		onshiServer = await cache.getOnshiServer();
	}

  async function doEnter() {
	await cache.setOnshiServer(onshiServer);
  }
</script>

<div>
	<ServiceHeader title="オンライン資格サーバー変更" />
  <div>
	<input type="text" bind:value={onshiServer} />
	<button on:click={doEnter}>設定</button>
  </div>
</div>
